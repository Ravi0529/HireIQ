"use client";

import ApplicantProfile from "@/components/profile/ApplicantProfile";
import RecruiterProfile from "@/components/profile/RecruiterProfile";
import { useSession } from "next-auth/react";
import { Loader2, User, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function RoleBasedProfilePage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role as "applicant" | "recruiter" | undefined;

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-blue-600 p-1"></div>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-center">Loading your profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-blue-600 p-1"></div>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Unauthorized Access
            </h2>
            <p className="text-gray-600 text-center mb-4">
              Please sign in to view your profile.
            </p>
            <a
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Sign In
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role === "recruiter") {
    return <RecruiterProfile />;
  }

  if (role === "applicant") {
    return <ApplicantProfile />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
        <div className="bg-blue-600 p-1"></div>
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <User className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Invalid Role
          </h2>
          <p className="text-gray-600 text-center">
            Your account role is not properly configured.
          </p>
          <p className="text-gray-600 text-center mt-2">
            Please contact support for assistance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
