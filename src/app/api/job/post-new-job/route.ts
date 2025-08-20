import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
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
    const recruiter = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        role: true,
      },
    });

    if (recruiter?.role !== "recruiter") {
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

    const {
      title,
      description,
      location,
      experience,
      salary,
      requiredSkills,
      workStatus,
    } = await req.json();

    if (
      !title?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !experience ||
      !requiredSkills ||
      !workStatus
    ) {
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

    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        location,
        experience,
        salary: salary || null,
        requiredSkills,
        workStatus,
        createdById: user.id,
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        newJob,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating job:", error);
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
