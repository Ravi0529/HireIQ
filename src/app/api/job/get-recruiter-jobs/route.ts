import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

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

    if (user?.role !== "recruiter") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Only recruiters can post jobs",
        },
        {
          status: 403,
        }
      );
    }

    const totalJobs = await prisma.job.count({
      where: {
        createdById: user.id,
      },
    });

    const jobs = await prisma.job.findMany({
      where: {
        createdById: user.id,
      },
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

    return new NextResponse(responseData, {
      status: 200,
      headers: { "Content-Type": "application/json" },
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
