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
  Briefcase,
  FileText,
  BarChart3,
  Brain,
  Target,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronUp,
  Crown,
  Star,
  Award,
  GraduationCap,
  Loader2,
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
import jsPDF from "jspdf";

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

const BLUE_PALETTE = ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

export default function JobAnalysisPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [data, setData] = useState<JobAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<ApplicantAnalysis | null>(null);
  const [expandedApplicant, setExpandedApplicant] = useState<string | null>(
    null
  );
  const [generatingPDF, setGeneratingPDF] = useState(false);

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
    setGeneratingPDF(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      pdf.setFillColor(59, 130, 246);
      pdf.rect(0, 0, pageWidth, 40, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.text("AI Interview Analysis Report", pageWidth / 2, 20, {
        align: "center",
      });
      pdf.setFontSize(12);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        30,
        { align: "center" }
      );

      yPosition = 50;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.text("Candidate Information", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      const candidateInfo = [
        `Name: ${applicant.applicant.firstName} ${applicant.applicant.lastName}`,
        `Email: ${applicant.applicant.email}`,
        `Position: ${applicant.job.title}`,
        `Interview Date: ${new Date(
          applicant.interviewDate
        ).toLocaleDateString()}`,
        `Overall Score: ${applicant.overallScore}/10`,
        `Status: ${applicant.status}`,
      ];

      candidateInfo.forEach((info) => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(info, margin, yPosition);
        yPosition += 8;
      });
      yPosition += 10;

      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(16);
      pdf.text("Score Breakdown", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      const scoreInfo = [
        `Communication: ${applicant.scores.communication}/10`,
        `Technical Knowledge: ${applicant.scores.technical}/10`,
        `Relevance to Role: ${applicant.scores.relevance}/10`,
        `Problem Solving: ${applicant.scores.problemSolving}/10`,
      ];

      scoreInfo.forEach((info) => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(info, margin, yPosition);
        yPosition += 8;
      });
      yPosition += 15;

      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(16);
      pdf.text("Resume Summary", margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      const resumeLines = pdf.splitTextToSize(
        applicant.resumeSummary,
        pageWidth - 2 * margin
      );
      resumeLines.forEach((line: string) => {
        if (yPosition > pageHeight - 15) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += 8;
      });
      yPosition += 15;

      if (applicant.analysis) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.text("AI Analysis Summary", margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        const summaryLines = pdf.splitTextToSize(
          applicant.analysis.summary,
          pageWidth - 2 * margin
        );
        summaryLines.forEach((line: string) => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 8;
        });
        yPosition += 15;

        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.text("Detailed Analysis", margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        applicant.analysis.aiAnalysis.forEach((analysis, index) => {
          const analysisLines = pdf.splitTextToSize(
            `${index + 1}. ${analysis}`,
            pageWidth - 2 * margin
          );
          analysisLines.forEach((line: string) => {
            if (yPosition > pageHeight - 15) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin, yPosition);
            yPosition += 8;
          });
          yPosition += 4;
        });
      }

      if (applicant.applicant.profile) {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.text("Profile Information", margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(12);
        const profileInfo = [
          `Education: ${applicant.applicant.profile.education}`,
          `Institute: ${applicant.applicant.profile.instituteName}`,
          `Experience: ${applicant.applicant.profile.experience}`,
        ];

        profileInfo.forEach((info) => {
          if (yPosition > pageHeight - 15) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(info, margin, yPosition);
          yPosition += 8;
        });
      }

      const currentPage = pdf.getNumberOfPages();
      pdf.setPage(currentPage);
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        "Generated by AI Interview System",
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      pdf.save(
        `ai-analysis-${applicant.applicant.firstName}-${applicant.applicant.lastName}.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  const toggleApplicantExpand = (applicantId: string) => {
    setExpandedApplicant(
      expandedApplicant === applicantId ? null : applicantId
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg rounded-2xl overflow-hidden">
          <div className="bg-blue-600 p-1"></div>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-center">
              Loading AI analysis data...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-blue-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-700">Analysis Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.applications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-blue-200 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-blue-800">
              No Analysis Available
            </CardTitle>
            <CardDescription>
              No applications with AI analysis data found for this job.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                AI Interview Analysis
              </h1>
              <p className="text-blue-700 mt-2">
                Intelligent candidate evaluation for {data.job.title}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-800 border-blue-300"
              >
                <Target className="h-3 w-3 mr-1" />
                {data.applications.length} Candidates Analyzed
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total Applications
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {data.statistics.totalApplications}
              </div>
              <p className="text-xs text-blue-600 mt-1">Candidates processed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">
                Accepted
              </CardTitle>
              <Award className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                {data.statistics.acceptedApplications}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {(
                  (data.statistics.acceptedApplications /
                    data.statistics.totalApplications) *
                  100
                ).toFixed(1)}
                % success rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">
                Average Score
              </CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {data.statistics.averageScore}/10
              </div>
              <div className="flex items-center mt-1">
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${data.statistics.averageScore * 10}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-blue-700">
                Rejection Rate
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {data.statistics.rejectionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Of total applications
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Score Distribution
              </CardTitle>
              <CardDescription className="text-blue-700">
                How candidates are distributed across score ranges
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
                          fill={BLUE_PALETTE[index % BLUE_PALETTE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Skills Assessment
              </CardTitle>
              <CardDescription className="text-blue-700">
                Average performance across key evaluation areas
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
                    <PolarGrid stroke="#3b82f6" opacity={0.3} />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: "#1e40af", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 10]}
                      tick={{ fill: "#1e40af", fontSize: 10 }}
                    />
                    <Radar
                      name="Average"
                      dataKey="value"
                      stroke="#1e40af"
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

        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Candidate Analysis
            </CardTitle>
            <CardDescription className="text-blue-700">
              {data.applications.length} candidates with AI-powered interview
              analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.applications.map((applicant) => (
                <div
                  key={applicant.id}
                  className={`bg-white rounded-xl border border-blue-100 p-4 transition-all hover:shadow-md ${
                    selectedApplicant?.id === applicant.id
                      ? "ring-2 ring-blue-500 ring-opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-medium">
                          {applicant.applicant.firstName[0]}
                          {applicant.applicant.lastName[0]}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-900">
                          {applicant.applicant.firstName}{" "}
                          {applicant.applicant.lastName}
                        </h4>
                        <p className="text-sm text-blue-600">
                          {applicant.applicant.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-2xl font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-lg">
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
                          className="flex items-center gap-1"
                        >
                          {applicant.status === "Accepted" && (
                            <Crown className="h-3 w-3" />
                          )}
                          {applicant.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50 cursor-pointer h-8"
                          onClick={() => setSelectedApplicant(applicant)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50 cursor-pointer h-8"
                          onClick={() => toggleApplicantExpand(applicant.id)}
                        >
                          {expandedApplicant === applicant.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {expandedApplicant === applicant.id && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-blue-800 mb-2">
                            Skills Assessment
                          </h5>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-700">
                                Communication
                              </span>
                              <span className="font-medium text-blue-900">
                                {applicant.scores.communication}/10
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-700">Technical</span>
                              <span className="font-medium text-blue-900">
                                {applicant.scores.technical}/10
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-700">Relevance</span>
                              <span className="font-medium text-blue-900">
                                {applicant.scores.relevance}/10
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-blue-700">
                                Problem Solving
                              </span>
                              <span className="font-medium text-blue-900">
                                {applicant.scores.problemSolving}/10
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium text-blue-800 mb-2">
                            Actions
                          </h5>
                          <Button
                            size="sm"
                            onClick={() => downloadApplicantAnalysis(applicant)}
                            disabled={generatingPDF}
                            className="w-full bg-blue-600 hover:bg-blue-700 cursor-pointer mb-2"
                          >
                            {generatingPDF ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2" />
                            )}
                            {generatingPDF ? "Generating..." : "Download PDF"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedApplicant && (
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-blue-900 text-2xl">
                      {selectedApplicant.applicant.firstName}{" "}
                      {selectedApplicant.applicant.lastName}
                    </CardTitle>
                    <CardDescription className="text-blue-700">
                      Detailed AI analysis and evaluation
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => downloadApplicantAnalysis(selectedApplicant)}
                    disabled={generatingPDF}
                    className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  >
                    {generatingPDF ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    {generatingPDF
                      ? "Generating PDF..."
                      : "Download PDF Report"}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Skills Radar
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Candidate&apos;s performance across evaluation areas
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
                        <PolarGrid stroke="#3b82f6" opacity={0.3} />
                        <PolarAngleAxis
                          dataKey="name"
                          tick={{ fill: "#1e40af", fontSize: 12 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 10]}
                          tick={{ fill: "#1e40af", fontSize: 10 }}
                        />
                        <Radar
                          name="Candidate"
                          dataKey="value"
                          stroke="#1e40af"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Score Breakdown
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Detailed performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedApplicantCategoryScores}>
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "#1e40af", fontSize: 12 }}
                        />
                        <YAxis
                          domain={[0, 10]}
                          tick={{ fill: "#1e40af", fontSize: 10 }}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="value"
                          name="Score"
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Resume Summary
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Candidate&apos;s background and qualifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-blue-900">
                    <p>{selectedApplicant.resumeSummary}</p>
                  </div>
                  {selectedApplicant.applicant.profile && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">
                          Education:
                        </span>
                        <span className="ml-2 text-blue-700">
                          {selectedApplicant.applicant.profile.education}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">
                          Institute:
                        </span>
                        <span className="ml-2 text blue-700">
                          {selectedApplicant.applicant.profile.instituteName}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-800">
                          Experience:
                        </span>
                        <span className="ml-2 text-blue-700">
                          {selectedApplicant.applicant.profile.experience}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedApplicant.analysis && (
                <>
                  <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
                    <CardHeader>
                      <CardTitle className="text-blue-900 flex items-center gap-2">
                        <Brain className="h-5 w-5 text-blue-600" />
                        Detailed Analysis
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        In-depth assessment metrics from AI evaluation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedApplicant.analysis.aiAnalysis.map(
                          (item: string, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                            >
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-700 border-blue-300 mt-1"
                              >
                                {index + 1}
                              </Badge>
                              <p className="text-blue-900">{item}</p>
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
    </div>
  );
}
