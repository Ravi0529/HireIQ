/*
  Warnings:

  - A unique constraint covering the columns `[applicationId]` on the table `InterviewInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "overallScore" INTEGER;

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
CREATE UNIQUE INDEX "Feedback_applicationId_key" ON "public"."Feedback"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_applicationId_key" ON "public"."Analysis"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewInfo_applicationId_key" ON "public"."InterviewInfo"("applicationId");

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Analysis" ADD CONSTRAINT "Analysis_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
