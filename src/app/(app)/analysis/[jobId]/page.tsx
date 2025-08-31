"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Download,
  User,
  Briefcase,
  FileText,
  BarChart3,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Feedback {
  id: string;
  strengths: string[];
  improvements: string[];
  createdAt: string;
  updatedAt: string;
}

interface Analysis {
  id: string;
  aiAnalysis: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
}

interface ApplicantAnalysis {
  id: string;
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile: {
      experience: string;
      education: string;
      instituteName: string;
    } | null;
  };
  job: {
    id: string;
    title: string;
  };
  status: string;
  overallScore: number;
  scores: {
    communication: number;
    technical: number;
    relevance: number;
    problemSolving: number;
  };
  feedback: Feedback | null;
  analysis: Analysis | null;
  interviewDate: string;
  resumeSummary: string;
}

interface JobAnalysisData {
  job: {
    id: string;
    title: string;
    description: string;
    requiredSkills: string[];
  };
  applications: ApplicantAnalysis[];
  statistics: {
    totalApplications: number;
    acceptedApplications: number;
    rejectionRate: number;
    averageScore: number;
    scoreDistribution: number[];
    avgCategoryScores: {
      communication: number;
      technical: number;
      relevance: number;
      problemSolving: number;
    };
  };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function JobAnalysisPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [data, setData] = useState<JobAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<ApplicantAnalysis | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/analysis/${jobId}`);

        if (response.data.success) {
          setData(response.data);
          if (response.data.applications.length > 0) {
            setSelectedApplicant(response.data.applications[0]);
          }
        } else {
          setError(response.data.error || "Failed to fetch analysis");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setError("An error occurred while fetching analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [jobId]);

  const downloadApplicantAnalysis = (applicant: ApplicantAnalysis) => {
    const analysisText = `
      Candidate Analysis Report
      ========================
      
      Candidate: ${applicant.applicant.firstName} ${
      applicant.applicant.lastName
    }
      Email: ${applicant.applicant.email}
      Position: ${applicant.job.title}
      Overall Score: ${applicant.overallScore}/10
      Status: ${applicant.status}
      Interview Date: ${new Date(applicant.interviewDate).toLocaleDateString()}
      
      RESUME SUMMARY:
      ${applicant.resumeSummary}
      
      SCORE BREAKDOWN:
      - Communication: ${applicant.scores.communication}/10
      - Technical Knowledge: ${applicant.scores.technical}/10
      - Relevance to Role: ${applicant.scores.relevance}/10
      - Problem Solving: ${applicant.scores.problemSolving}/10
      
      ${
        applicant.analysis
          ? `AI ANALYSIS:
      ${applicant.analysis.aiAnalysis.join("\n")}
      
      SUMMARY:
      ${applicant.analysis.summary}`
          : "No detailed analysis available"
      }
    `;

    const blob = new Blob([analysisText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analysis-${applicant.applicant.firstName}-${applicant.applicant.lastName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        Loading job analysis...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Error
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!data || data.applications.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Analysis Available</CardTitle>
            <CardDescription>
              No applications with analysis data found for this job.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const scoreDistributionData = [
    { name: "0-2", value: data.statistics.scoreDistribution[0] },
    { name: "2-4", value: data.statistics.scoreDistribution[1] },
    { name: "4-6", value: data.statistics.scoreDistribution[2] },
    { name: "6-8", value: data.statistics.scoreDistribution[3] },
    { name: "8-10", value: data.statistics.scoreDistribution[4] },
  ];

  const categoryScoresData = [
    {
      name: "Communication",
      value: data.statistics.avgCategoryScores.communication,
    },
    { name: "Technical", value: data.statistics.avgCategoryScores.technical },
    { name: "Relevance", value: data.statistics.avgCategoryScores.relevance },
    {
      name: "Problem Solving",
      value: data.statistics.avgCategoryScores.problemSolving,
    },
  ];

  const selectedApplicantCategoryScores = selectedApplicant
    ? [
        {
          name: "Communication",
          value: selectedApplicant.scores.communication,
        },
        { name: "Technical", value: selectedApplicant.scores.technical },
        { name: "Relevance", value: selectedApplicant.scores.relevance },
        {
          name: "Problem Solving",
          value: selectedApplicant.scores.problemSolving,
        },
      ]
    : [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            AI-powered analysis for {data.job.title}
          </p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.totalApplications}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.acceptedApplications}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (data.statistics.acceptedApplications /
                  data.statistics.totalApplications) *
                100
              ).toFixed(1)}
              % acceptance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.averageScore}/10
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rejection Rate
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.statistics.rejectionRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>
              How applicants are distributed across score ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoreDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {scoreDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Average Category Scores Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Category Scores</CardTitle>
            <CardDescription>
              Average performance across key areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={categoryScoresData}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name="Average"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applicants List */}
      <Card>
        <CardHeader>
          <CardTitle>Applicants Analysis</CardTitle>
          <CardDescription>
            {data.applications.length} candidates with interview analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.applications.map((applicant) => (
              <Card
                key={applicant.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedApplicant?.id === applicant.id
                    ? "border-primary border-2"
                    : ""
                }`}
                onClick={() => setSelectedApplicant(applicant)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {applicant.applicant.firstName}{" "}
                          {applicant.applicant.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {applicant.applicant.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {applicant.overallScore}/10
                      </div>
                      <Badge
                        variant={
                          applicant.status === "Accepted"
                            ? "default"
                            : applicant.status === "Rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {applicant.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Applicant Details */}
      {selectedApplicant && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {selectedApplicant.applicant.firstName}{" "}
              {selectedApplicant.applicant.lastName}
            </h2>
            <Button
              onClick={() => downloadApplicantAnalysis(selectedApplicant)}
              className="gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Download Analysis
            </Button>
          </div>

          {/* Selected Applicant Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skills Assessment</CardTitle>
                <CardDescription>
                  Candidate&apos;s performance across key areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={selectedApplicantCategoryScores}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar
                        name="Candidate"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>Detailed performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedApplicantCategoryScores}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Score" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Applicant Details */}
          <div className="grid grid-cols-1 gap-6">
            {/* Resume Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resume Summary</CardTitle>
                <CardDescription>
                  Candidate&apos;s background information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground/90">
                    {selectedApplicant.resumeSummary}
                  </p>
                </div>
                {selectedApplicant.applicant.profile && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Education:</span>{" "}
                      {selectedApplicant.applicant.profile.education}
                    </div>
                    <div>
                      <span className="font-medium">Institute:</span>{" "}
                      {selectedApplicant.applicant.profile.instituteName}
                    </div>
                    <div>
                      <span className="font-medium">Experience:</span>{" "}
                      {selectedApplicant.applicant.profile.experience}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {selectedApplicant.analysis && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>AI Analysis Summary</CardTitle>
                    <CardDescription>
                      Comprehensive evaluation of candidate performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-foreground/90">
                        {selectedApplicant.analysis.summary}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Analysis</CardTitle>
                    <CardDescription>
                      In-depth assessment metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedApplicant.analysis.aiAnalysis.map(
                        (item: string, index: number) => (
                          <div key={index} className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">
                              {index + 1}
                            </Badge>
                            <p className="text-foreground/90">{item}</p>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
