-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('recruiter', 'applicant');

-- CreateEnum
CREATE TYPE "public"."Industry" AS ENUM ('EdTech', 'FinTech', 'HealthTech', 'SaaS', 'ECommerce', 'Gaming', 'Logistics', 'RealEstate', 'CyberSecurity', 'Consulting', 'Manufacturing', 'Media', 'Travel', 'AI', 'Other');

-- CreateEnum
CREATE TYPE "public"."Experience" AS ENUM ('Fresher', 'OneToTwoYears', 'TwoToThreeYears', 'ThreeToFiveYears', 'FiveToSevenYears', 'SevenPlusYears');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('Student', 'SeachingForJob', 'WorkingProfessional');

-- CreateEnum
CREATE TYPE "public"."JobPreferences" AS ENUM ('SoftwareEngineer', 'WebDeveloper', 'DataAnalyst', 'DataScientist', 'UIUXDesigner', 'VideoEditor', 'Sales', 'Marketing', 'ProductManager', 'QAEngineer', 'DevOpsEngineer', 'BusinessAnalyst', 'ContentWriter', 'HR', 'CustomerSupport', 'Operations', 'Other');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('Applied', 'Accepted', 'Rejected');

-- CreateEnum
CREATE TYPE "public"."JobStatus" AS ENUM ('Open', 'Closed');

-- CreateEnum
CREATE TYPE "public"."WorkStatus" AS ENUM ('Remote', 'Offline');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'applicant',
    "password" TEXT NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecruiterProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyWebsite" TEXT,
    "industry" "public"."Industry" NOT NULL,
    "position" TEXT,
    "linkedInProfile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicantProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "education" TEXT NOT NULL,
    "instituteName" TEXT NOT NULL,
    "currentCompany" TEXT,
    "currentStatus" "public"."Status" NOT NULL,
    "experience" "public"."Experience" NOT NULL,
    "jobPreferences" "public"."JobPreferences"[],
    "linkedInProfile" TEXT,
    "xProfile" TEXT,
    "githubProfile" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "experience" "public"."Experience" NOT NULL,
    "salary" TEXT NOT NULL,
    "requiredSkills" TEXT[],
    "workStatus" "public"."WorkStatus" NOT NULL,
    "status" "public"."JobStatus" NOT NULL DEFAULT 'Open',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Application" (
    "id" TEXT NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'Applied',
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "overallScore" INTEGER,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InterviewInfo" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "resumeSummary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIMESTAMP(3),

    CONSTRAINT "InterviewInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QnA" (
    "id" TEXT NOT NULL,
    "interviewInfoId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QnA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "strengths" TEXT[],
    "improvements" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Analysis" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "aiAnalysis" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RecruiterProfile_userId_key" ON "public"."RecruiterProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApplicantProfile_userId_key" ON "public"."ApplicantProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewInfo_applicationId_key" ON "public"."InterviewInfo"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_applicationId_key" ON "public"."Feedback"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_applicationId_key" ON "public"."Analysis"("applicationId");

-- AddForeignKey
ALTER TABLE "public"."RecruiterProfile" ADD CONSTRAINT "RecruiterProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicantProfile" ADD CONSTRAINT "ApplicantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewInfo" ADD CONSTRAINT "InterviewInfo_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QnA" ADD CONSTRAINT "QnA_interviewInfoId_fkey" FOREIGN KEY ("interviewInfoId") REFERENCES "public"."InterviewInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analysis" ADD CONSTRAINT "Analysis_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
