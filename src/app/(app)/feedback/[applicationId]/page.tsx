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
import { CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
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
      Interview Feedback Report
      ========================
      
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
    a.download = `feedback-${data.applicant.firstName}-${data.applicant.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="container mx-auto p-6 space-y-6">loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Feedback Available</CardTitle>
            <CardDescription>
              Feedback data is not available for this application.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Interview Feedback</h1>
          <p className="text-muted-foreground">
            For {data.applicant.firstName} {data.applicant.lastName} -{" "}
            {data.job.title}
          </p>
        </div>
        <Button onClick={downloadFeedback} className="gap-2 cursor-pointer">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overall Score Card */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Assessment</CardTitle>
            <CardDescription>
              Candidate&apos;s performance summary
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score</span>
              <Badge
                variant={data.overallScore >= 6 ? "default" : "destructive"}
                className="text-lg px-3 py-1"
              >
                {data.overallScore}/10
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
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
                >
                  {data.applicationStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applicant Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Information</CardTitle>
            <CardDescription>Applicant details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {data.applicant.firstName} {data.applicant.lastName}
            </p>
            <p>
              <span className="font-medium">Email:</span> {data.applicant.email}
            </p>
            <p>
              <span className="font-medium">Position:</span> {data.job.title}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50 rounded-t-lg">
            <CardTitle className="text-green-700">Strengths</CardTitle>
            <CardDescription>What the candidate did well</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {data.feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Improvements Card */}
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50 rounded-t-lg">
            <CardTitle className="text-amber-700">
              Areas for Improvement
            </CardTitle>
            <CardDescription>Where the candidate can improve</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {data.feedback.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Q&A Section */}
      <Card>
        <CardHeader>
          <CardTitle>Interview Questions & Answers</CardTitle>
          <CardDescription>The complete interview transcript</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.qnas.map((qna, index) => (
              <div key={qna.id} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-1">
                    Q{index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-muted-foreground">
                      Question:
                    </p>
                    <p className="mb-3">{qna.question}</p>
                    <p className="font-medium text-sm text-muted-foreground">
                      Answer:
                    </p>
                    <p className="text-foreground/90">{qna.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
