"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Video, Mic, AlertCircle } from "lucide-react";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";

export default function VideoFeed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let stream: MediaStream;

    const initializeMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (error) {
        console.log(error);
        setError(
          "Unable to access camera or microphone. Please check your permissions."
        );
        setIsActive(false);
      }
    };

    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative">
      <Card className="flex items-center justify-center bg-black rounded-xl overflow-hidden border-2 border-blue-200">
        {error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
            <span className="text-red-500 text-sm">{error}</span>
          </div>
        ) : (
          <AspectRatio ratio={16 / 9}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </AspectRatio>
        )}
      </Card>

      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
        {isActive ? (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Offline</span>
          </>
        )}
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="bg-black/50 text-white p-1 rounded-full">
          <Video className="h-4 w-4" />
        </div>
        <div className="bg-black/50 text-white p-1 rounded-full">
          <Mic className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
