"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Building2,
  MapPin,
  Briefcase,
  Laptop,
  Calendar,
  User,
  Globe,
  Edit,
  BarChart3,
  Send,
  Loader2,
  ArrowLeft,
  IndianRupee,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import type { JobDetailsType } from "@/types/job-details";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const EXPERIENCE_LABELS: Record<string, string> = {
  Fresher: "Fresher",
  OneToTwoYears: "1-2 Years",
  TwoToThreeYears: "2-3 Years",
  ThreeToFiveYears: "3-5 Years",
  FiveToSevenYears: "5-7 Years",
  SevenPlusYears: "7+ Years",
};

interface ApplicationStatus {
  hasApplied: boolean;
  applicationId?: string;
  status?: string;
  hasInterview: boolean;
}

export default function JobDetails() {
  const { data: session } = useSession();
  const user = session?.user as
    | { id: string; role: "recruiter" | "applicant" }
    | undefined;

  const role = user?.role;
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [job, setJob] = useState<JobDetailsType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(
    {
      hasApplied: false,
      hasInterview: false,
    }
  );

  useEffect(() => {
    if (!jobId || !user?.id) return;

    setLoading(true);
    setError(null);
    axios
      .get<JobDetailsType>(`/api/job/${jobId}`)
      .then((response) => {
        setJob(response.data);
        if (user && response.data.createdBy?.id === user.id) {
          setIsOwner(true);
        }

        return axios.get(`/api/job/${jobId}/check-application`);
      })
      .then((response) => {
        setApplicationStatus(response.data);
      })
      .catch((error) =>
        setError(error?.response?.data?.error || "Failed to fetch job")
      )
      .finally(() => setLoading(false));
  }, [jobId, user]);

  const handleToggleJobStatus = async () => {
    if (!job) return;
    try {
      const response = await axios.patch(`/api/job/${jobId}`);
      if (response.data.job) {
        setJob(response.data.job);
        toast.success(
          `Job ${
            response.data.job.status === "Closed" ? "closed" : "reopened"
          } successfully`
        );
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update job status");
    }
  };

  const handleApply = () => {
    setApplying(true);
    if (applicationStatus.hasApplied) return;
    router.push(`/job/${jobId}/instructions`);
  };

  const handleViewFeedback = () => {
    if (applicationStatus.applicationId) {
      router.push(`/feedback/${applicationStatus.applicationId}`);
    }
  };

  const handleViewAnalysis = () => {
    router.push(`/analysis/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          Loading job details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <div className="bg-blue-600 p-1"></div>
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">Error</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <div className="bg-blue-600 p-1"></div>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">No job found</p>
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recruiterProfile = job.createdBy?.recruiterProfile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <div className="bg-blue-600 p-1"></div>
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {job.title}
                </CardTitle>
                {applicationStatus.hasApplied && (
                  <div className="flex items-center gap-2 text-green-600 mt-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {applicationStatus.status === "Applied" ||
                      "Accepted" ||
                      "Rejected"
                        ? "Application Submitted"
                        : "Interview Completed"}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-blue max-w-none"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </CardContent>
            </Card>

            {Array.isArray(job.requiredSkills) &&
              job.requiredSkills.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <div className="bg-blue-600 p-1"></div>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-semibold text-gray-800">
                      Required Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg sticky top-6">
              <div className="bg-blue-600 p-1"></div>
              <CardContent className="p-6">
                {recruiterProfile && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {recruiterProfile.companyName}
                        </h3>
                        {recruiterProfile.industry && (
                          <p className="text-sm text-gray-600">
                            {recruiterProfile.industry}
                          </p>
                        )}
                      </div>
                    </div>

                    {recruiterProfile.companyWebsite && (
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <a
                          href={recruiterProfile.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {recruiterProfile.companyWebsite}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  {job.status === "Closed" && (
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 border-yellow-300"
                      >
                        Job Closed
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{job.salary}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{job.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">{job.workStatus}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                      {EXPERIENCE_LABELS[job.experience] || job.experience}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700 text-sm">
                      Updated: {new Date(job.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {job.createdBy && (
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600 text-sm">
                        Posted by: {job.createdBy.firstName}{" "}
                        {job.createdBy.lastName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  {role === "applicant" && (
                    <>
                      {applicationStatus.hasApplied &&
                      applicationStatus.hasInterview ? (
                        <Button
                          onClick={handleViewFeedback}
                          className="w-full bg-green-600 hover:bg-green-700 cursor-pointer"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Feedback
                        </Button>
                      ) : applicationStatus.hasApplied ? (
                        <Button
                          disabled
                          className="w-full bg-gray-400 cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Application Submitted
                        </Button>
                      ) : job.status === "Closed" ? (
                        <Button
                          disabled
                          className="w-full bg-blue-400 cursor-not-allowed"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Job Closed
                        </Button>
                      ) : (
                        <Button
                          onClick={handleApply}
                          disabled={applying}
                          className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer"
                        >
                          {applying ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Apply Now
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  )}

                  {isOwner && role === "recruiter" && (
                    <>
                      <Button
                        onClick={() => router.push(`/job/${jobId}/edit`)}
                        variant="outline"
                        className="w-full cursor-pointer"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Job
                      </Button>

                      <Button
                        onClick={handleToggleJobStatus}
                        variant={
                          job.status === "Closed" ? "default" : "outline"
                        }
                        className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                      >
                        {job.status === "Closed" ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Reopen Job
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-2" /> Close Job
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={handleViewAnalysis}
                        variant="secondary"
                        className="w-full cursor-pointer"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analyze
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
