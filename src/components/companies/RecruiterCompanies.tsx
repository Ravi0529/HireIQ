"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import JobList from "../jobs/JobList";
import { Building2, PlusCircle } from "lucide-react";

export default function RecruiterCompanies() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Your Job Listings
              </h1>
              <p className="text-gray-500">
                Manage your posted jobs and track applications
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/job/new")}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4" />
            Post a New Job
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <JobList />
        </div>
      </div>
    </div>
  );
}
