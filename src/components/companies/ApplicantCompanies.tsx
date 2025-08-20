import JobList from "../jobs/JobList";
import { Building2 } from "lucide-react";

export default function ApplicantCompanies() {
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
                Available Job Opportunities
              </h1>
              <p className="text-gray-500">
                Browse through all available positions from top companies
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-8">
          <JobList />
        </div>
      </div>
    </div>
  );
}
