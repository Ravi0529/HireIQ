"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import VideoFeed from "@/components/interview/VideoFeed";
import AIFeed from "@/components/interview/AIFeed";
import QnASection from "@/components/interview/QnASection";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Loader2, Clock, Mic, Video, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InterviewPage() {
  const { status } = useSession();
  const router = useRouter();
  const { jobId } = useParams() as { jobId: string };
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [forceEnd, setForceEnd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchApplicationId = async () => {
      try {
        const response = await axios.get(`/api/job/${jobId}/get-applicationId`);
        setApplicationId(response.data.applicationId);
      } catch (error) {
        console.error(error);
        setError("Could not load your application. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationId();
  }, [jobId, status]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">
            Loading your interview session...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <Card className="p-8 max-w-md text-center bg-white rounded-xl shadow-lg border-0">
          <div className="bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <div className="text-red-600 text-xl font-bold">!</div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-sm text-gray-600 mb-6">
            Please make sure you have applied for this job, or contact support.
          </p>
          <Button
            onClick={() => router.push("/jobs")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Browse Jobs
          </Button>
        </Card>
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
        <Card className="p-8 max-w-md text-center bg-white rounded-xl shadow-lg border-0">
          <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Application Found
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't applied for this job yet.
          </p>
          <Button
            onClick={() => router.push(`/job/${jobId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Job Details
          </Button>
        </Card>
      </div>
    );
  }

  const handleEndInterview = () => {
    setForceEnd(true);
    router.push(`/feedback/${jobId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Video className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                AI Interview Session
              </h1>
              <p className="text-gray-500 text-sm">
                Real-time question and answer
              </p>
            </div>
          </div>

          <Button
            onClick={handleEndInterview}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            End Interview
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Video className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-gray-800">Your Camera</h2>
              </div>
              <VideoFeed />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Mic className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="font-semibold text-gray-800">AI Interviewer</h2>
              </div>
              <AIFeed />
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Mic className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="font-semibold text-gray-800">
                  Questions & Answers
                </h2>
              </div>
              <QnASection
                applicationId={applicationId}
                jobId={jobId}
                forceEnd={forceEnd}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
