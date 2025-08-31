/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  Mic,
  Send,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function QnASection({
  applicationId,
  jobId,
  forceEnd,
}: {
  applicationId: string;
  jobId: string;
  forceEnd?: boolean;
}) {
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const submissionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [timer, setTimer] = useState(300);
  const [interviewOver, setInterviewOver] = useState(false);
  const router = useRouter();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (submissionTimeoutRef.current)
        clearTimeout(submissionTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = async (audioBase64: string) => {
    if (!audioEnabled) return;

    try {
      setIsPlayingAudio(true);
      SpeechRecognition.stopListening();

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audioBlob = await fetch(
        `data:audio/mp3;base64,${audioBase64}`
      ).then((response) => response.blob());
      const audioUrl = URL.createObjectURL(audioBlob);

      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        if (!interviewOver) {
          startListeningForQuestion();
        }
      };

      audioRef.current.onerror = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        console.error("Audio playback failed");
        if (!interviewOver) {
          startListeningForQuestion();
        }
      };

      await audioRef.current.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlayingAudio(false);
      if (!interviewOver) {
        startListeningForQuestion();
      }
    }
  };

  const startListeningForQuestion = () => {
    if (!browserSupportsSpeechRecognition || isPlayingAudio) {
      return;
    }
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  };

  const fetchCurrentQuestion = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/interview/${applicationId}/qna`);

      if (response.data.currentQuestion) {
        setCurrentQuestion(response.data.currentQuestion);
        if (response.data.audio) {
          await playAudio(response.data.audio);
        } else {
          startListeningForQuestion();
        }
      } else {
        setCurrentQuestion("");
      }
    } catch (error) {
      console.error("Failed to load question:", error);
      setError("Failed to load question.");
      startListeningForQuestion();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentQuestion();
  }, [applicationId]);

  useEffect(() => {
    if (currentQuestion && !isProcessing && !loading && !isPlayingAudio) {
      if (!audioEnabled) {
        startListeningForQuestion();
      }
    }
  }, [currentQuestion, isProcessing, loading, isPlayingAudio, audioEnabled]);

  useEffect(() => {
    if (submissionTimeoutRef.current) {
      clearTimeout(submissionTimeoutRef.current);
      submissionTimeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(null);

    if (!listening || !currentQuestion || isProcessing || isPlayingAudio)
      return;

    if (transcript) {
      submissionTimeoutRef.current = setTimeout(() => {
        startCountdown();
      }, 5000);
    }

    return () => {
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
      }
    };
  }, [transcript, listening, currentQuestion, isProcessing, isPlayingAudio]);

  useEffect(() => {
    if (interviewOver) return;
    if (timer <= 0) {
      setInterviewOver(true);
      SpeechRecognition.stopListening();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, interviewOver]);

  const startCountdown = () => {
    setCountdown(5);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    submissionTimeoutRef.current = setTimeout(() => {
      handleStopAndSend();
    }, 5000);
  };

  const handleStopAndSend = async () => {
    if (
      !transcript.trim() ||
      loading ||
      isProcessing ||
      interviewOver ||
      isPlayingAudio
    )
      return;

    SpeechRecognition.stopListening();

    setIsProcessing(true);
    setError("");

    toast.message("Sending answer to AI...", {
      description: "Please wait while your answer is being processed",
    });

    try {
      const response = await axios.post(`/api/interview/${applicationId}/qna`, {
        answer: transcript.trim(),
      });

      if (response.data.success) {
        resetTranscript();
        if (response.data.question) {
          setCurrentQuestion(response.data.question);

          if (response.data.audio) {
            await playAudio(response.data.audio);
          } else {
            startListeningForQuestion();
          }

          toast.success("Answer submitted successfully!");
        } else {
          setCurrentQuestion("");
          toast.success("Interview completed!");
        }
      } else {
        throw new Error(response.data.error || "Failed to submit answer");
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
      setError("Failed to submit answer.");
      toast.error("Failed to submit answer. Please try again.");
      startListeningForQuestion();
    } finally {
      setIsProcessing(false);
      setCountdown(null);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      if (submissionTimeoutRef.current) {
        clearTimeout(submissionTimeoutRef.current);
        submissionTimeoutRef.current = null;
      }
    }
  };

  const retryListening = () => {
    if (isPlayingAudio) return;
    resetTranscript();
    startListeningForQuestion();
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled && currentQuestion && !isPlayingAudio) {
      fetchCurrentQuestion();
    }
  };

  useEffect(() => {
    if (forceEnd) {
      SpeechRecognition.stopListening();
      setCountdown(null);
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (submissionTimeoutRef.current)
        clearTimeout(submissionTimeoutRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAudio(false);
    }
  }, [forceEnd]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Time Remaining
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-bold text-blue-800">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAudio}
            className={`p-2 ${
              audioEnabled ? "text-blue-600" : "text-gray-400"
            }`}
            title={audioEnabled ? "Disable audio" : "Enable audio"}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError("")}
            className="ml-auto text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {currentQuestion && !interviewOver && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">
                Current Question
              </h3>
              {isPlayingAudio && (
                <div className="flex items-center gap-1 text-blue-600 text-xs">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"></span>
                    <span
                      className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="w-1 h-1 bg-blue-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                  <span>Playing audio...</span>
                </div>
              )}
            </div>
            <p className="text-gray-900">{currentQuestion}</p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mic className="h-4 w-4 text-blue-600" />
              Your Answer
            </h3>
            <div className="min-h-20 p-3 bg-gray-50 rounded border border-gray-200 text-gray-800">
              {transcript ||
                (listening
                  ? "Listening..."
                  : isPlayingAudio
                  ? "Waiting for question audio..."
                  : "Waiting for your response...")}
            </div>

            <div className="mt-3">
              {countdown !== null && (
                <div className="flex items-center gap-2 text-amber-600 text-sm">
                  <Clock className="h-4 w-4" />
                  Submitting in {countdown} seconds...
                </div>
              )}

              {listening && !countdown && !isPlayingAudio && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Listening for your answer...
                </div>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Processing your answer...
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                onClick={retryListening}
                disabled={
                  listening || isProcessing || loading || isPlayingAudio
                }
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {listening ? "Listening..." : "Restart Listening"}
              </Button>

              {transcript && !isPlayingAudio && (
                <Button
                  onClick={handleStopAndSend}
                  disabled={isProcessing || loading || isPlayingAudio}
                  size="sm"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                  Submit Answer
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={interviewOver}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <DialogTitle>Interview Complete</DialogTitle>
            </div>
            <DialogDescription>
              Your 5-minute interview session has ended. Thank you for
              participating!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => router.push(`/job/${jobId}`)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              View Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
