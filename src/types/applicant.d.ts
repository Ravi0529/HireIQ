export interface ApplicantProfile {
  phone: string;
  age: number;
  education: string;
  instituteName: string;
  currentCompany?: string | null;
  currentStatus: "Student" | "SearchingForJob" | "WorkingProfessional";
  experience:
    | "Fresher"
    | "OneToTwoYears"
    | "TwoToThreeYears"
    | "ThreeToFiveYears"
    | "FiveToSevenYears"
    | "SevenPlusYears";
  jobPreferences: string[];
  linkedInProfile?: string | null;
  xProfile?: string | null;
  githubProfile?: string | null;
  city: string;
  state: string;
}
