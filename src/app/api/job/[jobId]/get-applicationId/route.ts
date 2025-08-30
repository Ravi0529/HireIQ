import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

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
