import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        job: true,
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

    if (application.feedback) {
      return NextResponse.json({
        success: true,
        feedback: application.feedback,
        qnas: application.InterviewInfo?.qnas || [],
        applicationStatus: application.status,
        overallScore: application.overallScore,
        analysis: application.analysis,
        resumeSummary: application.InterviewInfo?.resumeSummary || "",
        applicant: application.applicant,
        job: application.job,
      });
    }

    if (
      !application.InterviewInfo ||
      application.InterviewInfo.qnas.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "No interview data found for this application",
        },
        {
          status: 400,
        }
      );
    }

    const qnas = application.InterviewInfo.qnas;
    const formattedQnas = qnas
      .map(
        (qna, index) =>
          `Q${index + 1}: ${qna.question}\nA${index + 1}: ${qna.answer}`
      )
      .join("\n\n");

    const openai = new OpenAI({
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    });

    const prompt = `
      You are an experienced hiring manager conducting a detailed analysis of a job interview.
      
      APPLICANT RESUME SUMMARY:
      ${application.InterviewInfo.resumeSummary}
      
      JOB DETAILS:
      - Title: ${application.job.title}
      - Description: ${application.job.description}
      - Required Skills: ${application.job.requiredSkills.join(", ")}
      - Experience Level: ${application.job.experience}
      
      INTERVIEW Q&A:
      ${formattedQnas}
      
      TASKS:
      1. Analyze the candidate's responses and provide a comprehensive evaluation
      2. Generate a list of strengths (what the candidate did well)
      3. Generate a list of improvements (areas where the candidate can improve)
      4. Assign an overall score from 1-10 based on the interview performance
      5. Provide a detailed summary analysis of the candidate's performance
      
      GUIDELINES:
      - For strengths: Be specific and detailed. Reference exact responses when possible.
      - For improvements: Be constructive and provide actionable advice.
      - For scoring: Consider communication skills, technical knowledge, relevance to the role, and overall fit.
      - For the summary: Provide a comprehensive analysis of the candidate's suitability for the role.
      - Return the response in JSON format with this structure:
        {
          "strengths": ["detailed strength 1", "detailed strength 2", ...],
          "improvements": ["detailed improvement 1", "detailed improvement 2", ...],
          "overallScore": number (1-10),
          "scoreBreakdown": {
            "communication": number (1-10),
            "technicalKnowledge": number (1-10),
            "relevanceToRole": number (1-10),
            "problemSolving": number (1-10)
          },
          "summary": "Detailed summary analysis of the candidate's performance..."
        }
    `;

    const response = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: "Please analyze this interview and provide feedback.",
        },
      ],
      response_format: { type: "json_object" },
    });

    const analysisResult = JSON.parse(
      response.choices[0]?.message?.content || "{}"
    );

    const { strengths, improvements, overallScore, scoreBreakdown, summary } =
      analysisResult;

    const newStatus = overallScore >= 6 ? "Accepted" : "Rejected";

    const result = await prisma.$transaction([
      prisma.feedback.create({
        data: {
          applicationId,
          strengths,
          improvements,
        },
      }),

      prisma.application.update({
        where: {
          id: applicationId,
        },
        data: {
          overallScore,
          status: newStatus,
        },
      }),

      prisma.analysis.create({
        data: {
          applicationId,
          aiAnalysis: [
            `Communication Score: ${scoreBreakdown?.communication || 0}/10`,
            `Technical Knowledge Score: ${
              scoreBreakdown?.technicalKnowledge || 0
            }/10`,
            `Relevance to Role Score: ${
              scoreBreakdown?.relevanceToRole || 0
            }/10`,
            `Problem Solving Score: ${scoreBreakdown?.problemSolving || 0}/10`,
            summary || "No summary available",
          ],
        },
      }),
    ]);

    const chartData = {
      scores: {
        overall: overallScore,
        communication: scoreBreakdown?.communication || 0,
        technicalKnowledge: scoreBreakdown?.technicalKnowledge || 0,
        relevanceToRole: scoreBreakdown?.relevanceToRole || 0,
        problemSolving: scoreBreakdown?.problemSolving || 0,
      },
      categoryScores: [
        { name: "Communication", value: scoreBreakdown?.communication || 0 },
        { name: "Technical", value: scoreBreakdown?.technicalKnowledge || 0 },
        { name: "Relevance", value: scoreBreakdown?.relevanceToRole || 0 },
        { name: "Problem Solving", value: scoreBreakdown?.problemSolving || 0 },
      ],
    };

    return NextResponse.json({
      success: true,
      feedback: {
        ...result[0],
        strengths,
        improvements,
      },
      qnas,
      applicationStatus: newStatus,
      overallScore,
      analysis: {
        ...result[2],
        summary,
      },
      chartData,
      resumeSummary: application.InterviewInfo.resumeSummary,
      applicant: application.applicant,
      job: application.job,
    });
  } catch (error) {
    console.error("Feedback generation error:", error);
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
