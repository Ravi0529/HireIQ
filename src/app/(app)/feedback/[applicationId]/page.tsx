"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Brain,
  Target,
  User,
  FileText,
  Lightbulb,
  Crown,
  Award,
  Loader2,
} from "lucide-react";
import axios from "axios";

interface QnA {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

interface Feedback {
  id: string;
  strengths: string[];
  improvements: string[];
  createdAt: string;
}

interface ApplicationData {
  feedback: Feedback;
  qnas: QnA[];
  applicationStatus: string;
  overallScore: number;
  applicant: {
    firstName: string;
    lastName: string;
    email: string;
  };
  job: {
    title: string;
  };
}

export default function FeedbackPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/feedback/${applicationId}`);
        const result = response.data;

        if (result.success) {
          setData(result);
        } else {
          setError(result.error || "Failed to fetch feedback");
        }
      } catch (error) {
        console.log(error);
        setError("An error occurred while fetching feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [applicationId]);

  const downloadFeedback = () => {
    if (!data) return;

    const feedbackText = `
      AI Interview Feedback Report
      ============================
      
      Candidate: ${data.applicant.firstName} ${data.applicant.lastName}
      Position: ${data.job.title}
      Overall Score: ${data.overallScore}/10
      Status: ${data.applicationStatus}
      
      STRENGTHS:
      ${data.feedback.strengths
        .map((strength, index) => `${index + 1}. ${strength}`)
        .join("\n")}
      
      AREAS FOR IMPROVEMENT:
      ${data.feedback.improvements
        .map((improvement, index) => `${index + 1}. ${improvement}`)
        .join("\n")}
      
      INTERVIEW Q&A:
      ${data.qnas
        .map(
          (qna, index) => `
      Q${index + 1}: ${qna.question}
      A${index + 1}: ${qna.answer}
      `
        )
        .join("\n")}
    `;

    const blob = new Blob([feedbackText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-feedback-${data.applicant.firstName}-${data.applicant.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-blue-600 p-1"></div>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-center">
              Loading AI feedback data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-blue-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-700">Feedback Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-blue-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-blue-800">
              No Feedback Available
            </CardTitle>
            <CardDescription>
              Feedback data is not available for this application.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                AI Interview Feedback
              </h1>
              <p className="text-blue-700 mt-2">
                For {data.applicant.firstName} {data.applicant.lastName} -{" "}
                {data.job.title}
              </p>
            </div>
            <Button
              onClick={downloadFeedback}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer mt-4 md:mt-0"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">
                Overall Assessment
              </CardTitle>
              <Target className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">Score</span>
                <Badge
                  variant={data.overallScore >= 6 ? "default" : "destructive"}
                  className="text-lg px-3 py-1"
                >
                  {data.overallScore}/10
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  {data.applicationStatus === "Accepted" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <Badge
                    variant={
                      data.applicationStatus === "Accepted"
                        ? "default"
                        : "destructive"
                    }
                    className="flex items-center gap-1"
                  >
                    {data.applicationStatus === "Accepted" && (
                      <Crown className="h-3 w-3" />
                    )}
                    {data.applicationStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">
                Candidate Information
              </CardTitle>
              <User className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center">
                <span className="font-medium text-blue-800 w-20">Name:</span>
                <span className="text-blue-700">
                  {data.applicant.firstName} {data.applicant.lastName}
                </span>
              </p>
              <p className="flex items-center">
                <span className="font-medium text-blue-800 w-20">Email:</span>
                <span className="text-blue-700">{data.applicant.email}</span>
              </p>
              <p className="flex items-center">
                <span className="font-medium text-blue-800 w-20">
                  Position:
                </span>
                <span className="text-blue-700">{data.job.title}</span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="bg-green-50 rounded-t-lg">
              <CardTitle className="text-green-700 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Strengths
              </CardTitle>
              <CardDescription className="text-green-600">
                What the candidate did well
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {data.feedback.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-green-800">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="bg-amber-50 rounded-t-lg">
              <CardTitle className="text-amber-700 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
              <CardDescription className="text-amber-600">
                Where the candidate can improve
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {data.feedback.improvements.map((improvement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg"
                  >
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-amber-800">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Interview Questions & Answers
            </CardTitle>
            <CardDescription className="text-blue-700">
              The complete AI-powered interview transcript
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.qnas.map((qna, index) => (
                <div
                  key={qna.id}
                  className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50 rounded-r-lg"
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-700 border-blue-300 mt-1"
                    >
                      Q{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-blue-700 mb-2">
                        Question:
                      </p>
                      <p className="mb-4 text-blue-900 bg-white p-3 rounded-lg border border-blue-100">
                        {qna.question}
                      </p>
                      <p className="font-medium text-sm text-blue-700 mb-2">
                        Answer:
                      </p>
                      <p className="text-blue-900 bg-white p-3 rounded-lg border border-blue-100">
                        {qna.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
