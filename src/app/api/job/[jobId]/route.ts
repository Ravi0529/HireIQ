import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
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

    return new NextResponse(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
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

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
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

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
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
          error: "Forbidden - You can only manage your own jobs",
        },
        {
          status: 403,
        }
      );
    }

    const newStatus = job.status === "Open" ? "Closed" : "Open";
    const updatedJob = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error updating job status:", error);
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
