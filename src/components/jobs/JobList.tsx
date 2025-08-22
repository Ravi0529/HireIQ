import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { JobFormValues } from "@/types/job";
import { useSession } from "next-auth/react";
import {
  Building2,
  MapPin,
  IndianRupee,
  Briefcase,
  Laptop,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function JobList() {
  const { data: session } = useSession();
  const role = session?.user?.role as "recruiter" | "applicant" | undefined;
  const [jobs, setJobs] = useState<JobFormValues[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!role) return;
    fetchJobs(currentPage);
  }, [role, currentPage]);

  const fetchJobs = async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (role === "recruiter") {
        response = await axios.get(`/api/job/get-recruiter-jobs?page=${page}`);
      } else {
        response = await axios.get(`/api/job/get-all-job-posts?page=${page}`);
      }

      setJobs(response.data.jobs);
      setTotalPages(response.data.pagination.totalPages);
      setTotalJobs(response.data.pagination.totalJobs);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (!role) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span>Loading role...</span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span>Loading jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-500">
            {role === "recruiter"
              ? "You haven't posted any jobs yet. Create your first job posting!"
              : "No job opportunities available at the moment. Check back later!"}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {jobs.map((job) => {
              const updatedAt = new Date(job.updatedAt).toLocaleDateString();
              return (
                <div
                  key={job.id}
                  className="border border-gray-200 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-800 mb-1 md:mb-0">
                          {job.title}
                        </h3>
                        <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          {job._count?.applications || 0} applications
                        </span>
                      </div>

                      {job.createdBy?.recruiterProfile?.companyName && (
                        <div className="text-gray-700 font-medium mb-3">
                          {job.createdBy.recruiterProfile.companyWebsite ? (
                            <a
                              href={
                                job.createdBy.recruiterProfile.companyWebsite
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              {job.createdBy.recruiterProfile.companyName}
                            </a>
                          ) : (
                            job.createdBy.recruiterProfile.companyName
                          )}
                          {job.createdBy?.recruiterProfile?.industry && (
                            <span className="text-gray-500 ml-2">
                              • {job.createdBy.recruiterProfile.industry}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {job.description
                          .replace(/<[^>]*>/g, "")
                          .substring(0, 150)}
                        ...
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <IndianRupee className="w-4 h-4 mr-1 text-blue-600" />
                          <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 mr-1 text-blue-600" />
                          <span>{job.experience}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Laptop className="w-4 h-4 mr-1 text-blue-600" />
                          <span>{job.workStatus}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Updated: {updatedAt}
                        </div>
                        <Button
                          onClick={() => router.push(`/job/${job.id}`)}
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, totalJobs)} of {totalJobs} jobs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="px-2 text-gray-500">...</span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
