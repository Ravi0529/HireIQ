"use client";

import { useState, useEffect } from "react";
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
import axios from "axios";
import { useRouter } from "next/navigation";
import { Tiptap } from "../Tiptap";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  IndianRupee,
  Code,
  Laptop,
  Loader2,
  X,
} from "lucide-react";
import { JobFormValues } from "@/types/job-form-values";

const EXPERIENCE_OPTIONS = [
  { label: "Fresher", value: "Fresher" },
  { label: "1-2 Years", value: "OneToTwoYears" },
  { label: "2-3 Years", value: "TwoToThreeYears" },
  { label: "3-5 Years", value: "ThreeToFiveYears" },
  { label: "5-7 Years", value: "FiveToSevenYears" },
  { label: "7+ Years", value: "SevenPlusYears" },
];

const WORK_STATUS_OPTIONS = [
  { label: "Remote", value: "Remote" },
  { label: "Offline", value: "Offline" },
];

export default function JobForm({
  jobId,
  initialValues,
}: {
  jobId?: string;
  initialValues?: Partial<JobFormValues>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [workStatus, setWorkStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title || "");
      setDescription(initialValues.description || "");
      setLocation(initialValues.location || "");
      setExperience(initialValues.experience || "");
      setSalary(initialValues.salary || "");
      setRequiredSkills(initialValues.requiredSkills || []);
      setWorkStatus(initialValues.workStatus || "");
    }
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (
      !title ||
      !description ||
      !location ||
      !experience ||
      requiredSkills.length === 0 ||
      !workStatus ||
      !salary
    ) {
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }
    try {
      if (jobId) {
        await axios.put(`/api/job/${jobId}`, {
          title,
          description,
          location,
          experience,
          salary,
          requiredSkills,
          workStatus,
        });
        toast.success("Job updated successfully!");
      } else {
        await axios.post("/api/job/post-new-job", {
          title,
          description,
          location,
          experience,
          salary,
          requiredSkills,
          workStatus,
        });
        toast.success("Job posted successfully!");
      }
      setTitle("");
      setDescription("");
      setLocation("");
      setExperience("");
      setSalary("");
      setRequiredSkills([]);
      setWorkStatus("");

      router.replace(`/job/${jobId}`);
    } catch (error) {
      console.log(error);
      toast.error("Failed to save job.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      if (!requiredSkills.includes(skillInput.trim())) {
        setRequiredSkills([...requiredSkills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
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
              {jobId ? "Edit Job Posting" : "Create New Job Posting"}
            </CardTitle>
            <CardDescription className="text-gray-500">
              {jobId
                ? "Update your job details"
                : "Post a new job opportunity for candidates"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">
                    <Briefcase className="inline h-4 w-4 mr-1" />
                    Job Title <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="e.g. Frontend Developer"
                      className="pl-9 h-10"
                    />
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-gray-700">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Location <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="e.g. Bangalore, Remote"
                      className="pl-9 h-10"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-gray-700">
                    Experience <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="experience"
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

                <div className="space-y-2">
                  <Label htmlFor="workStatus" className="text-gray-700">
                    <Laptop className="inline h-4 w-4 mr-1" />
                    Work Status <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="workStatus"
                      value={workStatus}
                      onChange={(e) => setWorkStatus(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full border rounded-md px-3 py-2 bg-background pl-9 h-10"
                    >
                      <option value="" disabled>
                        Select Work Status
                      </option>
                      {WORK_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Laptop className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-gray-700">
                    <IndianRupee className="inline h-4 w-4 mr-1" />
                    Salary <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="salary"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      disabled={loading}
                      placeholder="e.g. ₹ 15000-20000 /month, ₹ 3-4 LPA, Unpaid"
                      className="pl-9 h-10"
                    />
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredSkills" className="text-gray-700">
                    <Code className="inline h-4 w-4 mr-1" />
                    Required Skills <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="requiredSkills"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      disabled={loading}
                      placeholder="Type a skill and press Enter or Comma"
                      className="pl-9 h-10"
                    />
                    <Code className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 text-red-500 hover:text-red-700 cursor-pointer"
                          aria-label={`Remove ${skill}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-gray-700">
                    Job Description <span className="text-red-600">*</span>
                  </Label>
                </div>
                <Tiptap content={description} onChange={setDescription} />
              </div>
            </CardContent>

            <CardFooter className="flex gap-4 px-6 pb-6 mt-6">
              <Button
                type="submit"
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    {jobId ? "Updating..." : "Posting..."}
                  </>
                ) : jobId ? (
                  "Update Job"
                ) : (
                  "Post Job"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
