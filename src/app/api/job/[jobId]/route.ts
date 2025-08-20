import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

const getParticularJobCacheKey = (id: string) => `job:${id}`;

export const GET = async (
  req: NextRequest,
  { params }: { params: { jobId: string } }
) => {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  const { jobId } = await params;

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
    const cacheKey = getParticularJobCacheKey(jobId);
    const cachedJob = await redis.get(cacheKey);

    if (cachedJob) {
      console.log("Serving job from cache");
      return new NextResponse(cachedJob, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    const singleJobPost = await prisma.job.findUnique({
      where: {
        id: jobId,
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

    if (!singleJobPost) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        {
          status: 404,
        }
      );
    }

    const responseData = JSON.stringify({
      success: true,
      singleJobPost,
    });

    await redis.set(cacheKey, responseData, "EX", 86400);
    console.log("Stored job in cache");

    return new NextResponse(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
