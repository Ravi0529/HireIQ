import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

const getParticularJobCacheKey = (id: string) => `job:${id}`;

const invalidateJobCache = async (jobId: string) => {
  await redis.del(getParticularJobCacheKey(jobId));
  console.log(`Invalidated cache for job: ${jobId}`);

  const jobListKeys = await redis.keys("jobs:page:*");
  if (jobListKeys.length > 0) {
    await redis.del(...jobListKeys);
    console.log("Invalidated all jobs list cache");
  }
};

export const GET = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/");
  const jobId = pathSegments[pathSegments.indexOf("job") + 1];

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

    const responseData = JSON.stringify(singleJobPost);

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

export const PUT = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/");
  const jobId = pathSegments[pathSegments.indexOf("job") + 1];

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

  if (user?.role?.toLowerCase() !== "recruiter") {
    return NextResponse.json(
      {
        success: false,
        error: "Forbidden - Only recruiters can manage jobs",
      },
      {
        status: 403,
      }
    );
  }

  try {
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
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

    if (job.createdById !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - You can only edit your own jobs",
        },
        {
          status: 403,
        }
      );
    }

    const data = await req.json();
    if (!data?.title || !data?.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    const updatedJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        experience: data.experience,
        salary: data.salary,
        requiredSkills: data.requiredSkills,
        workStatus: data.workStatus,
        updatedAt: new Date(),
      },
    });

    await invalidateJobCache(jobId);

    return NextResponse.json({
      success: true,
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job:", error);
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

export const DELETE = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/");
  const jobId = pathSegments[pathSegments.indexOf("job") + 1];

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
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
    });

    if (!job) {
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

    if (job.createdById !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden - You can only delete your own jobs",
        },
        {
          status: 403,
        }
      );
    }

    await prisma.job.delete({
      where: {
        id: jobId,
      },
    });

    await invalidateJobCache(jobId);

    return NextResponse.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
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
