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
  Building2,
  Globe,
  Briefcase,
  Linkedin,
  Loader2,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import type { RecruiterProfile } from "@/types/recruiter";

const INDUSTRY_OPTIONS = [
  { label: "EdTech", value: "EdTech" },
  { label: "FinTech", value: "FinTech" },
  { label: "HealthTech", value: "HealthTech" },
  { label: "SaaS", value: "SaaS" },
  { label: "ECommerce", value: "ECommerce" },
  { label: "Gaming", value: "Gaming" },
  { label: "Logistics", value: "Logistics" },
  { label: "RealEstate", value: "RealEstate" },
  { label: "CyberSecurity", value: "CyberSecurity" },
  { label: "Consulting", value: "Consulting" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Media", value: "Media" },
  { label: "Travel", value: "Travel" },
  { label: "AI", value: "AI" },
  { label: "Other", value: "Other" },
];

export default function RecruiterProfile() {
  const { data: session } = useSession();
  const user = session?.user;

  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [industry, setIndustry] = useState<string>("");
  const [position, setPosition] = useState("");
  const [linkedInProfile, setLinkedInProfile] = useState("");

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    axios
      .get("/api/recruiter-profile")
      .then((res: AxiosResponse<{ profile: RecruiterProfile }>) => {
        const data = res.data.profile;
        setCompanyName(data.companyName || "");
        setCompanyWebsite(data.companyWebsite || "");
        setIndustry(
          data.industry
            ? Array.isArray(data.industry)
              ? data.industry[0] || ""
              : data.industry
            : ""
        );
        setPosition(data.position || "");
        setLinkedInProfile(data.linkedInProfile || "");
      })
      .catch(() => {
        toast.error("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!companyName || !industry) {
      toast.error("Company name and industry are required.");
      setLoading(false);
      return;
    }

    const payload: Partial<RecruiterProfile> = {
      companyName,
      industry,
    };

    if (companyWebsite) payload.companyWebsite = companyWebsite;
    if (position) payload.position = position;
    if (linkedInProfile) payload.linkedInProfile = linkedInProfile;

    try {
      await axios.post("/api/recruiter-profile", payload);
      toast.success("Profile saved successfully.");
      router.replace("/companies");
    } catch (error) {
      console.log(error);
      toast.error("Failed to save profile.");
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
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="w-full border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-blue-600 p-1"></div>

          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Recruiter Profile
            </CardTitle>
            <CardDescription className="text-gray-500">
              Update your company information
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
                      Recruiter Account
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-700">
                    <Building2 className="inline h-4 w-4 mr-1" />
                    Company Name <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="companyName"
                      name="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-gray-700">
                    Industry <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="industry"
                      name="industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full border rounded-md px-3 py-2 bg-background pl-9 h-10"
                    >
                      <option value="" disabled>
                        Select Industry
                      </option>
                      {INDUSTRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite" className="text-gray-700">
                    <Globe className="inline h-4 w-4 mr-1" />
                    Company Website
                  </Label>
                  <div className="relative">
                    <Input
                      id="companyWebsite"
                      name="companyWebsite"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      disabled={loading}
                      className="pl-9 h-10"
                    />
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-gray-700">
                    <User className="inline h-4 w-4 mr-1" />
                    Position
                  </Label>
                  <div className="relative">
                    <Input
                      id="position"
                      name="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={loading}
                      placeholder="HR, CTO, Hiring Manager, etc."
                      className="pl-9 h-10"
                    />
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedInProfile" className="text-gray-700">
                  <Linkedin className="inline h-4 w-4 mr-1" />
                  LinkedIn Profile
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
            </CardContent>

            <CardFooter className="flex flex-col gap-3 px-6 pb-6 mt-4">
              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 cursor-pointer"
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
