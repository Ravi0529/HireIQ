"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
  Mic,
  Video,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  Volume2,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!jobId || status !== "authenticated") return;

      try {
        const response = await axios.get(`/api/job/${jobId}/check-application`);

        if (response.data.hasApplied && response.data.hasInterview) {
          router.push(`/feedback/${response.data.applicationId}`);
          toast.error("You have already completed the interview for this job");
        } else if (response.data.hasApplied) {
          toast.info(
            "You have already applied for this job. You can proceed with the interview."
          );
        }
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    };

    checkApplicationStatus();
  }, [jobId, status, router]);

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
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Interview Instructions
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
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
              className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer"
              onClick={handleDialogStartInterview}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparing Interview...
                </>
              ) : (
                <>
                  Start Interview Now
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!dialogOpen && (
        <div className="max-w-2xl mx-auto p-6 min-h-screen flex items-center justify-center">
          <Card className="w-full border-gray-200 shadow-sm">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Prepare for Your AI Interview
              </CardTitle>
              <p className="text-gray-500 text-sm">
                Complete these steps to ensure a smooth interview experience
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-blue-600" />
                    Microphone Check
                  </Label>
                  <span
                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      micChecked
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {micChecked ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Ready
                      </>
                    ) : (
                      "Not checked"
                    )}
                  </span>
                </div>
                <Button
                  variant={micChecked ? "outline" : "default"}
                  onClick={handleMicCheck}
                  disabled={micChecked || micChecking}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {micChecked ? (
                    "Microphone Ready"
                  ) : micChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Check Microphone
                    </>
                  )}
                </Button>
                {micError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    {micError}
                  </div>
                )}
                {micChecking && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Volume2 className="w-4 h-4" />
                        Voice Level
                      </p>
                      <span className="text-xs text-gray-500">
                        Speak into your microphone
                      </span>
                    </div>
                    <Progress
                      value={Math.min(100, (audioLevel / 256) * 100)}
                      className="h-2"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-600" />
                    Camera Check
                  </Label>
                  <span
                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                      camChecked
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {camChecked ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Ready
                      </>
                    ) : (
                      "Not checked"
                    )}
                  </span>
                </div>
                <Button
                  variant={camChecked ? "outline" : "default"}
                  onClick={handleCamCheck}
                  disabled={camChecked}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {camChecked ? (
                    "Camera Ready"
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Check Camera
                    </>
                  )}
                </Button>
                {camError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
                    <AlertCircle className="w-4 h-4" />
                    {camError}
                  </div>
                )}
                {videoStream && (
                  <div className="mt-2">
                    <AspectRatio ratio={16 / 9}>
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="rounded-lg border border-gray-200 w-full h-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 border border-gray-200 rounded-lg">
                <Label
                  htmlFor="resume"
                  className="text-base font-medium text-gray-700 flex items-center gap-2"
                >
                  <Upload className="w-5 h-5 text-blue-600" />
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
                  <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-2 rounded-md">
                    <CheckCircle className="w-4 h-4" />
                    Selected: {resume.name}
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-base flex items-center justify-center gap-2 cursor-pointer"
                disabled={!micChecked || !camChecked || !resume || loading}
                onClick={handleStartInterview}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Begin Interview
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
