export interface JobDetailsType {
  id: string;
  title: string;
  description: string;
  location: string;
  experience: string;
  salary: string;
  requiredSkills: string[];
  workStatus: string;
  updatedAt: string;
  createdAt: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    recruiterProfile?: {
      companyName?: string;
      companyWebsite?: string;
      industry?: string;
    };
  };
  _count?: {
    applications: number;
  };
}
