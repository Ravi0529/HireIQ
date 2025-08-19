import { NextRequest, NextResponse } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

const getProfileCacheKey = (userId: string) => `recruiter:profile:${userId}`;

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
    const cacheKey = getProfileCacheKey(user.id);
    const cachedProfile = await redis.get(cacheKey);

    if (cachedProfile) {
      console.log("Serving recruiter profile from cache");
      return new NextResponse(cachedProfile, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    const profile = await prisma.recruiterProfile.findUnique({
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

    await redis.setex(cacheKey, 86400, responseData);
    console.log("Stored recruiter profile in cache");

    return new NextResponse(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching recruiter profile:", error);
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
    const { companyName, companyWebsite, industry, position, linkedInProfile } =
      await req.json();

    if (!companyName || !industry) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: companyName or industry",
        },
        {
          status: 400,
        }
      );
    }

    const existingProfile = await prisma.recruiterProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    const payload = {
      companyName,
      industry,
      ...(companyWebsite && { companyWebsite }),
      ...(position && { position }),
      ...(linkedInProfile && { linkedInProfile }),
      user: {
        connect: {
          id: user.id,
        },
      },
    };

    const profile = existingProfile
      ? await prisma.recruiterProfile.update({
          where: {
            userId: user.id,
          },
          data: payload,
        })
      : await prisma.recruiterProfile.create({
          data: payload,
        });

    const cacheKey = getProfileCacheKey(user.id);
    await redis.del(cacheKey);
    console.log("Invalidated recruiter profile cache after update");

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
    console.error("Error creating/updating recruiter profile:", error);
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
