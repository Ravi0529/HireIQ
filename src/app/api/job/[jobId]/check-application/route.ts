import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;
  const userId = session.user.id;

  try {
    const application = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: userId,
      },
      include: {
        InterviewInfo: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({
        hasApplied: false,
        hasInterview: false,
      });
    }

    return NextResponse.json({
      hasApplied: true,
      applicationId: application.id,
      status: application.status,
      hasInterview: !!application.InterviewInfo,
    });
  } catch (error) {
    console.error("Error checking application:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
