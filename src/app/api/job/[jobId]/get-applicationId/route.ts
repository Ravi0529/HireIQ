import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import redis from "@/lib/redis";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { jobId } = await params;

  try {
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }

    const cacheKey = `application:${userId}:${jobId}`;
    const cachedApplication = await redis.get(cacheKey);

    if (cachedApplication) {
      const applicationData = JSON.parse(cachedApplication);
      return NextResponse.json({
        applicationId: applicationData.id,
        cached: true,
      });
    }

    const application = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: userId,
      },
    });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found",
        },
        {
          status: 404,
        }
      );
    }

    await redis.set(cacheKey, JSON.stringify(application), "EX", 86400);

    return NextResponse.json({
      applicationId: application.id,
      cached: false,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
};
