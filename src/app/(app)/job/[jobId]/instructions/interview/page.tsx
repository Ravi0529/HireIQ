"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import VideoFeed from "@/components/interview/VideoFeed";
import AIFeed from "@/components/interview/AIFeed";
import QnASection from "@/components/interview/QnASection";
import { Card } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
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
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">
            Loading your interview session...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please make sure you have applied for this job, or contact support.
          </p>
        </Card>
      </div>
    );
  }

  if (!applicationId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-lg font-semibold mb-2">No Application Found</h2>
          <p className="text-muted-foreground mb-4">
            You haven&apos;t applied for this job yet.
          </p>
          <button
            onClick={() => router.push(`/job/${jobId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Go to Job Page
          </button>
        </Card>
      </div>
    );
  }

  const handleEndInterview = () => {
    setForceEnd(true);
    router.push(`/feedback/${jobId}`);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen gap-6 p-4 box-border">
      <Button
        onClick={handleEndInterview}
        variant="default"
        className="bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        End Interview
      </Button>
      <div className="w-full md:w-3/5 flex">
        <VideoFeed />
      </div>
      <div className="w-full md:w-2/5 flex flex-col gap-6">
        <AIFeed />
        <QnASection
          applicationId={applicationId}
          jobId={jobId}
          forceEnd={forceEnd}
        />
      </div>
    </div>
  );
}
