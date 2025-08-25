export interface JobFormValues {
  id: string;
  title: string;
  description: string;
  location: string;
  experience: string;
  salary: string;
  requiredSkills: string[];
  workStatus: string;
  updatedAt: string;
  createdBy?: {
    id?: string;
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
