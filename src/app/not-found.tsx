"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Home, Building2, Clock, ArrowRight } from "lucide-react";

export default function NotFound() {
  const { data: session } = useSession();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const redirectTimer = setTimeout(() => {
      if (session) {
        router.push("/companies");
      } else {
        router.push("/");
      }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
        <div className="bg-blue-600 p-1"></div>

        <CardContent className="p-6">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <AlertCircle className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-800">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700">
                Page Not Found
              </h2>
            </div>

            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-800">
                The page you're looking for doesn't exist or has been moved.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Clock className="h-5 w-5" />
              <p className="text-sm">
                Redirecting in{" "}
                <span className="font-bold text-blue-600">{countdown}</span>{" "}
                seconds...
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 px-6 pb-6">
          <Button
            onClick={() => {
              if (session) {
                router.push("/companies");
              } else {
                router.push("/");
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {session ? (
              <>
                Go to Companies
                <Building2 className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Go to Homepage
                <Home className="ml-2 h-4 w-4" />
              </>
            )}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
