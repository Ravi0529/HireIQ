import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

const getProfileCacheKey = (userId: string) => `applicant:profile:${userId}`;

export const GET = async () => {
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
    const cacheKey = getProfileCacheKey(user.id);
    const cachedProfile = await redis.get(cacheKey);

    if (cachedProfile) {
      console.log("Serving applicant profile from cache");
      return new NextResponse(cachedProfile, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    const profile = await prisma.applicantProfile.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found",
        },
        {
          status: 404,
        }
      );
    }

    const responseData = JSON.stringify({
      success: true,
      profile,
    });

    await redis.set(cacheKey, responseData, "EX", 86400);
    console.log("Stored recruiter profile in cache");

    return new NextResponse(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching applicant profile:", error);
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
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found in database. Please sign up first.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      phone,
      age,
      education,
      instituteName,
      currentCompany,
      currentStatus,
      experience,
      jobPreferences,
      linkedInProfile,
      xProfile,
      githubProfile,
      city,
      state,
    } = await req.json();

    if (
      !phone ||
      !age ||
      !education ||
      !instituteName ||
      !currentStatus ||
      !experience ||
      !jobPreferences ||
      !city ||
      !state
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: Phone number, Age, Institute Name, Current Status, Experience, Job Preferences, city, and state",
        },
        {
          status: 400,
        }
      );
    }

    const existingProfile = await prisma.applicantProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    const payload = {
      phone,
      age,
      education,
      instituteName,
      currentStatus,
      experience,
      jobPreferences,
      ...(currentCompany && { currentCompany }),
      ...(linkedInProfile && { linkedInProfile }),
      ...(xProfile && { xProfile }),
      ...(githubProfile && { githubProfile }),
      city,
      state,
      user: {
        connect: {
          id: user.id,
        },
      },
    };

    const profile = existingProfile
      ? await prisma.applicantProfile.update({
          where: {
            userId: user.id,
          },
          data: payload,
        })
      : await prisma.applicantProfile.create({
          data: payload,
        });

    const cacheKey = getProfileCacheKey(user.id);
    await redis.del(cacheKey);
    console.log("Invalidated applicant profile cache after update");

    return new NextResponse(
      JSON.stringify({
        success: true,
        profile,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating/updating applicant profile:", error);
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
