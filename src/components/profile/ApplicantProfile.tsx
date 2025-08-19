import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Calendar,
  GraduationCap,
  Building,
  MapPin,
  Linkedin,
  Twitter,
  Github,
  Briefcase,
  User,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const STATUS_OPTIONS = [
  { label: "Student", value: "Student" },
  { label: "Searching for Job", value: "SearchingForJob" },
  { label: "Working Professional", value: "WorkingProfessional" },
];

const EXPERIENCE_OPTIONS = [
  { label: "Fresher", value: "Fresher" },
  { label: "1-2 Years", value: "OneToTwoYears" },
  { label: "2-3 Years", value: "TwoToThreeYears" },
  { label: "3-5 Years", value: "ThreeToFiveYears" },
  { label: "5-7 Years", value: "FiveToSevenYears" },
  { label: "7+ Years", value: "SevenPlusYears" },
];

const JOB_PREFERENCES_OPTIONS = [
  { label: "Software Engineer", value: "SoftwareEngineer" },
  { label: "Web Developer", value: "WebDeveloper" },
  { label: "Data Analyst", value: "DataAnalyst" },
  { label: "Data Scientist", value: "DataScientist" },
  { label: "UI/UX Designer", value: "UIUXDesigner" },
  { label: "Video Editor", value: "VideoEditor" },
  { label: "Sales", value: "Sales" },
  { label: "Marketing", value: "Marketing" },
  { label: "Product Manager", value: "ProductManager" },
  { label: "QA Engineer", value: "QAEngineer" },
  { label: "DevOps Engineer", value: "DevOpsEngineer" },
  { label: "Business Analyst", value: "BusinessAnalyst" },
  { label: "Content Writer", value: "ContentWriter" },
  { label: "HR", value: "HR" },
  { label: "Customer Support", value: "CustomerSupport" },
  { label: "Operations", value: "Operations" },
  { label: "Other", value: "Other" },
];

export default function ApplicantProfile() {
  const { data: session } = useSession();
  const user = session?.user;

  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [education, setEducation] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [experience, setExperience] = useState("");
  const [jobPreferences, setJobPreferences] = useState<string[]>([]);
  const [linkedInProfile, setLinkedInProfile] = useState("");
  const [xProfile, setXProfile] = useState("");
  const [githubProfile, setGithubProfile] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    axios
      .get("/api/applicant-profile")
      .then((res: AxiosResponse<any>) => {
        const data = res.data.profile;
        setPhone(data.phone || "");
        setAge(data.age?.toString() || "");
        setEducation(data.education || "");
        setInstituteName(data.instituteName || "");
        setCurrentCompany(data.currentCompany || "");
        setCurrentStatus(data.currentStatus || "");
        setExperience(data.experience || "");
        setJobPreferences(data.jobPreferences || []);
        setLinkedInProfile(data.linkedInProfile || "");
        setXProfile(data.xProfile || "");
        setGithubProfile(data.githubProfile || "");
        setCity(data.city || "");
        setState(data.state || "");
      })
      .catch(() => {
        toast.error("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleJobPreferenceChange = (value: string) => {
    setJobPreferences((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (
      !phone ||
      !age ||
      !education ||
      !instituteName ||
      !currentStatus ||
      !experience ||
      jobPreferences.length === 0 ||
      !city ||
      !state
    ) {
      toast.error("Please fill all required fields.");
      setLoading(false);
      return;
    }

    const payload = {
      phone,
      age: parseInt(age),
      education,
      instituteName,
      currentCompany: currentCompany || null,
      currentStatus,
      experience,
      jobPreferences,
      linkedInProfile: linkedInProfile || null,
      xProfile: xProfile || null,
      githubProfile: githubProfile || null,
      city,
      state,
    };

    try {
      await axios.post("/api/applicant-profile", payload);
      toast.success("Profile saved successfully.");
      router.replace("/companies");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to save profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="w-full border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-blue-600 p-1"></div>

          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Applicant Profile
            </CardTitle>
            <CardDescription className="text-gray-500">
              Complete your professional profile to find the best job
              opportunities
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-6">
              {user && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <Avatar className="h-16 w-16 border-2 border-blue-300">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                      {user.firstName?.[0]?.toUpperCase()}
                      {user.lastName?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-800">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Job Seeker Account
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-700">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Age <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      min="18"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="education" className="text-gray-700">
                    <GraduationCap className="inline h-4 w-4 mr-1" />
                    Education <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="education"
                      name="education"
                      placeholder="B.Tech, B.E., MCA, etc."
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instituteName" className="text-gray-700">
                    <Building className="inline h-4 w-4 mr-1" />
                    Institute Name <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="instituteName"
                      name="instituteName"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCompany" className="text-gray-700">
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  Current Company (if applicable)
                </Label>
                <div className="relative">
                  <Input
                    id="currentCompany"
                    name="currentCompany"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    disabled={loading}
                    className="pl-9 h-10"
                  />
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentStatus" className="text-gray-700">
                    Current Status <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="currentStatus"
                      name="currentStatus"
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full border rounded-md px-3 py-2 bg-background pl-9 h-10"
                    >
                      <option value="" disabled>
                        Select Status
                      </option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-700">
                    Experience <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="experience"
                      name="experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full border rounded-md px-3 py-2 bg-background pl-9 h-10"
                    >
                      <option value="" disabled>
                        Select Experience
                      </option>
                      {EXPERIENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">
                  Job Preferences <span className="text-red-600">*</span>
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {JOB_PREFERENCES_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`pref-${option.value}`}
                        checked={jobPreferences.includes(option.value)}
                        onChange={() => handleJobPreferenceChange(option.value)}
                        disabled={loading}
                        className="mr-2 h-4 w-4 text-blue-600 rounded"
                      />
                      <label
                        htmlFor={`pref-${option.value}`}
                        className="text-sm text-gray-700"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-gray-700">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    City <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="city"
                      name="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state" className="text-gray-700">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    State <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="state"
                      name="state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedInProfile" className="text-gray-700">
                    <Linkedin className="inline h-4 w-4 mr-1" />
                    LinkedIn
                  </Label>
                  <div className="relative">
                    <Input
                      id="linkedInProfile"
                      name="linkedInProfile"
                      value={linkedInProfile}
                      onChange={(e) => setLinkedInProfile(e.target.value)}
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="xProfile" className="text-gray-700">
                    <Twitter className="inline h-4 w-4 mr-1" />X (Twitter)
                  </Label>
                  <div className="relative">
                    <Input
                      id="xProfile"
                      name="xProfile"
                      value={xProfile}
                      onChange={(e) => setXProfile(e.target.value)}
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="githubProfile" className="text-gray-700">
                    <Github className="inline h-4 w-4 mr-1" />
                    GitHub
                  </Label>
                  <div className="relative">
                    <Input
                      id="githubProfile"
                      name="githubProfile"
                      value={githubProfile}
                      onChange={(e) => setGithubProfile(e.target.value)}
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 px-6 pb-6 mt-4">
              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  "Save Profile"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
