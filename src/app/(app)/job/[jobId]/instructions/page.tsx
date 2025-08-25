"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

export default function InstructionsPage() {
  const router = useRouter();
  const { status } = useSession();
  const params = useParams();
  const jobId = params?.jobId as string;

  const [micChecked, setMicChecked] = useState(false);
  const [camChecked, setCamChecked] = useState(false);
  const [resume, setResume] = useState<File | null>(null);

  const [micError, setMicError] = useState<string | null>(null);
  const [camError, setCamError] = useState<string | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);
  const [micChecking, setMicChecking] = useState(false);
  const audioRef = useRef<MediaStream | null>(null);
  const animationId = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleMicCheck = async () => {
    setMicError(null);
    setMicChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioCtx();

      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const animate = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg);
        animationId.current = requestAnimationFrame(animate);
      };

      animate();
      setMicChecked(true);
    } catch (error) {
      console.log(error);
      setMicError("Microphone access denied or not available.");
      setMicChecking(false);
    }
  };

  const handleCamCheck = async () => {
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoStream(stream);
      setCamChecked(true);
    } catch (error) {
      console.log(error);
      setCamError("Camera access denied or not available.");
    }
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.getTracks().forEach((track) => track.stop());
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state === "running"
      ) {
        audioContextRef.current.close();
      }
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
      }
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [videoStream]);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleStartInterview = async () => {
    if (!resume)
      return toast.error("Please add your Resume for the Interview.");
    setLoading(true);
    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const response = await axios.post(
        `/api/job/${jobId}/upload-resume`,
        formData
      );
      if (response.data && response.data.success) {
        toast.success("Resume saved successfully!");
      } else {
        toast.error(response.data?.error || "Failed to save resume summary.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to upload and process resume.");
    }
    setLoading(false);
    setDialogOpen(true);
  };

  const handleDialogStartInterview = () => {
    setLoading(true);
    setDialogOpen(false);
    router.push(`/job/${jobId}/instructions/interview`);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">
              Interview Instructions
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Please read the following instructions carefully before starting
              your AI-powered interview.
            </DialogDescription>
            <ul className="list-disc pl-5 space-y-2 mt-4 text-sm text-gray-700">
              <li>
                The interview will last approximately <b>5 minutes</b>.
              </li>
              <li>
                An <b>AI interviewer</b> will ask you questions based on your
                resume and the job description.
              </li>
              <li>Your responses will be recorded and analyzed.</li>
              <li>
                After the interview, you will receive comprehensive{" "}
                <b>feedback</b> and suggestions for improvement.
              </li>
              <li>
                Ensure your microphone and camera are working properly in a
                quiet, well-lit environment.
              </li>
            </ul>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleDialogStartInterview}
              disabled={loading}
            >
              {loading ? "Preparing Interview..." : "Start Interview Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!dialogOpen && (
        <div className="max-w-5xl mx-auto p-6 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
          <Card className="w-full shadow-lg border-0">
            <CardHeader className="text-center space-y-2 pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Prepare for Your AI Interview
              </CardTitle>
              <p className="text-gray-500 text-sm">
                Complete these steps to ensure a smooth interview experience
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Microphone Check</Label>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      micChecked
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {micChecked ? "Ready" : "Not checked"}
                  </span>
                </div>
                <Button
                  variant={micChecked ? "outline" : "default"}
                  onClick={handleMicCheck}
                  disabled={micChecked || micChecking}
                  className="w-full"
                >
                  {micChecked
                    ? "Microphone Ready"
                    : micChecking
                    ? "Testing..."
                    : "Check Microphone"}
                </Button>
                {micError && <p className="text-red-600 text-sm">{micError}</p>}
                {micChecking && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Voice Level - Speak into your microphone
                    </p>
                    <Progress
                      value={Math.min(100, (audioLevel / 256) * 100)}
                      className="h-2"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Camera Check</Label>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      camChecked
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {camChecked ? "Ready" : "Not checked"}
                  </span>
                </div>
                <Button
                  variant={camChecked ? "outline" : "default"}
                  onClick={handleCamCheck}
                  disabled={camChecked}
                  className="w-full"
                >
                  {camChecked ? "Camera Ready" : "Check Camera"}
                </Button>
                {camError && <p className="text-red-600 text-sm">{camError}</p>}
                {videoStream && (
                  <div className="mt-2">
                    <AspectRatio ratio={16 / 9}>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="rounded-lg border w-full h-full object-cover shadow-sm"
                      />
                    </AspectRatio>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="resume" className="text-base">
                  Upload Your Resume (PDF)
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="flex-1"
                  />
                </div>
                {resume && (
                  <p className="text-green-700 text-sm flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Selected: {resume.name}
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 py-3 text-base"
                disabled={!micChecked || !camChecked || !resume || loading}
                onClick={handleStartInterview}
              >
                {loading ? "Processing..." : "Begin Interview Preparation"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
