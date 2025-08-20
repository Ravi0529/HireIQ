import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

const ITEMS_PER_PAGE = 10;

const getJobsCacheKey = (page: number) => `jobs:page:${page}`;

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user || !user.email) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const cacheKey = getJobsCacheKey(page);
    const cachedJobs = await redis.get(cacheKey);

    if (cachedJobs) {
      console.log(`Serving jobs page ${page} from cache`);
      return new NextResponse(cachedJobs, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    const totalJobs = await prisma.job.count();

    const jobs = await prisma.job.findMany({
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            recruiterProfile: {
              select: {
                companyName: true,
                companyWebsite: true,
                industry: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    const responseData = JSON.stringify({
      success: true,
      jobs,
      pagination: {
        totalJobs,
        totalPages: Math.ceil(totalJobs / ITEMS_PER_PAGE),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalJobs / ITEMS_PER_PAGE),
        hasPrevPage: page > 1,
      },
    });

    await redis.setex(cacheKey, 604800, responseData);
    console.log(`Stored jobs page ${page} in cache for 7 days`);

    return new NextResponse(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error getting jobs:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
