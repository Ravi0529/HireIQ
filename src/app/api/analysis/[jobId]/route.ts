import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        createdBy: true,
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

    const applications = await prisma.application.findMany({
      where: {
        jobId,
        InterviewInfo: {
          isNot: null,
        },
        analysis: {
          isNot: null,
        },
      },
      include: {
        applicant: {
          include: {
            applicantProfile: true,
          },
        },
        InterviewInfo: {
          include: {
            qnas: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
        feedback: true,
        analysis: true,
        job: true,
      },
      orderBy: {
        overallScore: "desc",
      },
    });

    const analysisData = applications.map((application) => {
      let communicationScore = 0;
      let technicalScore = 0;
      let relevanceScore = 0;
      let problemSolvingScore = 0;

      if (application.analysis) {
        application.analysis.aiAnalysis.forEach((analysis) => {
          if (analysis.includes("Communication Score")) {
            communicationScore =
              parseInt(analysis.split("/")[0].split(": ")[1]) || 0;
          } else if (analysis.includes("Technical Knowledge Score")) {
            technicalScore =
              parseInt(analysis.split("/")[0].split(": ")[1]) || 0;
          } else if (analysis.includes("Relevance to Role Score")) {
            relevanceScore =
              parseInt(analysis.split("/")[0].split(": ")[1]) || 0;
          } else if (analysis.includes("Problem Solving Score")) {
            problemSolvingScore =
              parseInt(analysis.split("/")[0].split(": ")[1]) || 0;
          }
        });
      }

      return {
        id: application.id,
        applicant: {
          id: application.applicant.id,
          firstName: application.applicant.firstName,
          lastName: application.applicant.lastName,
          email: application.applicant.email,
          profile: application.applicant.applicantProfile,
        },
        job: {
          id: application.job.id,
          title: application.job.title,
        },
        status: application.status,
        overallScore: application.overallScore,
        scores: {
          communication: communicationScore,
          technical: technicalScore,
          relevance: relevanceScore,
          problemSolving: problemSolvingScore,
        },
        feedback: application.feedback,
        analysis: application.analysis,
        interviewDate: application.InterviewInfo?.createdAt,
        resumeSummary: application.InterviewInfo?.resumeSummary,
      };
    });

    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(
      (app) => app.status === "Accepted"
    ).length;
    const averageScore =
      applications.reduce((sum, app) => sum + (app.overallScore || 0), 0) /
      totalApplications;

    const scoreDistribution = [0, 0, 0, 0, 0];
    applications.forEach((app) => {
      const score = app.overallScore || 0;
      if (score <= 2) scoreDistribution[0]++;
      else if (score <= 4) scoreDistribution[1]++;
      else if (score <= 6) scoreDistribution[2]++;
      else if (score <= 8) scoreDistribution[3]++;
      else scoreDistribution[4]++;
    });

    const avgCategoryScores = {
      communication:
        analysisData.reduce((sum, app) => sum + app.scores.communication, 0) /
        totalApplications,
      technical:
        analysisData.reduce((sum, app) => sum + app.scores.technical, 0) /
        totalApplications,
      relevance:
        analysisData.reduce((sum, app) => sum + app.scores.relevance, 0) /
        totalApplications,
      problemSolving:
        analysisData.reduce((sum, app) => sum + app.scores.problemSolving, 0) /
        totalApplications,
    };

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills,
      },
      applications: analysisData,
      statistics: {
        totalApplications,
        acceptedApplications,
        rejectionRate:
          ((totalApplications - acceptedApplications) / totalApplications) *
          100,
        averageScore: parseFloat(averageScore.toFixed(2)),
        scoreDistribution,
        avgCategoryScores,
      },
    });
  } catch (error) {
    console.error("Job analysis fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
