/*
  Warnings:

  - You are about to drop the column `completionPercentage` on the `user_roadmaps` table. All the data in the column will be lost.
  - You are about to drop the column `currentModule` on the `user_roadmaps` table. All the data in the column will be lost.
  - You are about to drop the column `currentPhase` on the `user_roadmaps` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdated` on the `user_roadmaps` table. All the data in the column will be lost.
  - You are about to drop the column `learningPace` on the `user_roadmaps` table. All the data in the column will be lost.
  - You are about to drop the column `roadmapId` on the `user_roadmaps` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `user_roadmaps` table. All the data in the column will be lost.
  - You are about to alter the column `progress` on the `user_roadmaps` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `daily_plans` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `feedbacks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `learning_tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `milestones` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recommendation_factors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recommendation_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `resources` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roadmap_modules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roadmap_phases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roadmaps` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_tasks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `weekly_plans` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,careerId]` on the table `user_roadmaps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `careerId` to the `user_roadmaps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `careerName` to the `user_roadmaps` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user_roadmaps` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "daily_plans" DROP CONSTRAINT "daily_plans_weeklyPlanId_fkey";

-- DropForeignKey
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_recommendationId_fkey";

-- DropForeignKey
ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_userId_fkey";

-- DropForeignKey
ALTER TABLE "learning_tasks" DROP CONSTRAINT "learning_tasks_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "milestones" DROP CONSTRAINT "milestones_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "recommendation_factors" DROP CONSTRAINT "recommendation_factors_recommendationId_fkey";

-- DropForeignKey
ALTER TABLE "recommendation_results" DROP CONSTRAINT "recommendation_results_careerPathId_fkey";

-- DropForeignKey
ALTER TABLE "recommendation_results" DROP CONSTRAINT "recommendation_results_userId_fkey";

-- DropForeignKey
ALTER TABLE "resources" DROP CONSTRAINT "resources_taskId_fkey";

-- DropForeignKey
ALTER TABLE "roadmap_modules" DROP CONSTRAINT "roadmap_modules_phaseId_fkey";

-- DropForeignKey
ALTER TABLE "roadmap_phases" DROP CONSTRAINT "roadmap_phases_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "roadmaps" DROP CONSTRAINT "roadmaps_careerPathId_fkey";

-- DropForeignKey
ALTER TABLE "user_roadmaps" DROP CONSTRAINT "user_roadmaps_roadmapId_fkey";

-- DropForeignKey
ALTER TABLE "user_tasks" DROP CONSTRAINT "user_tasks_taskId_fkey";

-- DropForeignKey
ALTER TABLE "user_tasks" DROP CONSTRAINT "user_tasks_userId_fkey";

-- DropForeignKey
ALTER TABLE "weekly_plans" DROP CONSTRAINT "weekly_plans_userId_fkey";

-- DropIndex
DROP INDEX "user_roadmaps_userId_roadmapId_key";

-- AlterTable
ALTER TABLE "career_paths" ADD COLUMN     "academicSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "prerequisites" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "relevantProjectDomains" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "required_skills" ADD COLUMN     "minimumProficiency" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "recommendedProficiency" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "skillType" TEXT NOT NULL DEFAULT 'IMPORTANT';

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "canonicalName" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "difficulty" INTEGER NOT NULL DEFAULT 3;

-- AlterTable
ALTER TABLE "user_roadmaps" DROP COLUMN "completionPercentage",
DROP COLUMN "currentModule",
DROP COLUMN "currentPhase",
DROP COLUMN "lastUpdated",
DROP COLUMN "learningPace",
DROP COLUMN "roadmapId",
DROP COLUMN "startedAt",
ADD COLUMN     "careerId" TEXT NOT NULL,
ADD COLUMN     "careerName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentStage" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'GENERATED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "progress" SET DEFAULT 0,
ALTER COLUMN "progress" SET DATA TYPE INTEGER;

-- DropTable
DROP TABLE "daily_plans";

-- DropTable
DROP TABLE "feedbacks";

-- DropTable
DROP TABLE "learning_tasks";

-- DropTable
DROP TABLE "milestones";

-- DropTable
DROP TABLE "recommendation_factors";

-- DropTable
DROP TABLE "recommendation_results";

-- DropTable
DROP TABLE "resources";

-- DropTable
DROP TABLE "roadmap_modules";

-- DropTable
DROP TABLE "roadmap_phases";

-- DropTable
DROP TABLE "roadmaps";

-- DropTable
DROP TABLE "user_tasks";

-- DropTable
DROP TABLE "weekly_plans";

-- CreateTable
CREATE TABLE "career_recommendation_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "algorithmVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "knowledgeVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "profileSnapshot" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,

    CONSTRAINT "career_recommendation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_interests" (
    "id" TEXT NOT NULL,
    "careerPathId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,

    CONSTRAINT "career_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_knowledge" (
    "id" TEXT NOT NULL,
    "careerId" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_knowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_abilities" (
    "id" TEXT NOT NULL,
    "careerKnowledgeId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_abilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_work_activities" (
    "id" TEXT NOT NULL,
    "careerKnowledgeId" TEXT NOT NULL,
    "elementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dataValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_work_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_software" (
    "id" TEXT NOT NULL,
    "careerKnowledgeId" TEXT NOT NULL,
    "softwareName" TEXT NOT NULL,
    "category" TEXT,
    "hotTechnology" BOOLEAN NOT NULL DEFAULT false,
    "inDemand" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_software_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_education" (
    "id" TEXT NOT NULL,
    "careerKnowledgeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dataValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_training" (
    "id" TEXT NOT NULL,
    "careerKnowledgeId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dataValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "related_careers" (
    "id" TEXT NOT NULL,
    "careerKnowledgeId" TEXT NOT NULL,
    "relatedTitle" TEXT NOT NULL,
    "relatednessTier" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "related_careers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_assessment_questions" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SINGLE_CHOICE',
    "order" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_assessment_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_assessment_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "careerWeights" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_assessment_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_assessment_responses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedValue" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_assessment_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "career_recommendation_history_userId_createdAt_idx" ON "career_recommendation_history"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "career_interests_careerPathId_idx" ON "career_interests"("careerPathId");

-- CreateIndex
CREATE UNIQUE INDEX "career_interests_careerPathId_interestId_key" ON "career_interests"("careerPathId", "interestId");

-- CreateIndex
CREATE UNIQUE INDEX "career_knowledge_careerId_key" ON "career_knowledge"("careerId");

-- CreateIndex
CREATE INDEX "career_abilities_careerKnowledgeId_idx" ON "career_abilities"("careerKnowledgeId");

-- CreateIndex
CREATE INDEX "career_work_activities_careerKnowledgeId_idx" ON "career_work_activities"("careerKnowledgeId");

-- CreateIndex
CREATE INDEX "career_software_careerKnowledgeId_idx" ON "career_software"("careerKnowledgeId");

-- CreateIndex
CREATE INDEX "career_education_careerKnowledgeId_idx" ON "career_education"("careerKnowledgeId");

-- CreateIndex
CREATE INDEX "career_training_careerKnowledgeId_idx" ON "career_training"("careerKnowledgeId");

-- CreateIndex
CREATE INDEX "related_careers_careerKnowledgeId_idx" ON "related_careers"("careerKnowledgeId");

-- CreateIndex
CREATE INDEX "career_assessment_options_questionId_idx" ON "career_assessment_options"("questionId");

-- CreateIndex
CREATE INDEX "career_assessment_responses_userId_idx" ON "career_assessment_responses"("userId");

-- CreateIndex
CREATE INDEX "career_assessment_responses_questionId_idx" ON "career_assessment_responses"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "career_assessment_responses_userId_questionId_key" ON "career_assessment_responses"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roadmaps_userId_careerId_key" ON "user_roadmaps"("userId", "careerId");

-- AddForeignKey
ALTER TABLE "career_recommendation_history" ADD CONSTRAINT "career_recommendation_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_interests" ADD CONSTRAINT "career_interests_careerPathId_fkey" FOREIGN KEY ("careerPathId") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_interests" ADD CONSTRAINT "career_interests_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_knowledge" ADD CONSTRAINT "career_knowledge_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_abilities" ADD CONSTRAINT "career_abilities_careerKnowledgeId_fkey" FOREIGN KEY ("careerKnowledgeId") REFERENCES "career_knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_work_activities" ADD CONSTRAINT "career_work_activities_careerKnowledgeId_fkey" FOREIGN KEY ("careerKnowledgeId") REFERENCES "career_knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_software" ADD CONSTRAINT "career_software_careerKnowledgeId_fkey" FOREIGN KEY ("careerKnowledgeId") REFERENCES "career_knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_education" ADD CONSTRAINT "career_education_careerKnowledgeId_fkey" FOREIGN KEY ("careerKnowledgeId") REFERENCES "career_knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_training" ADD CONSTRAINT "career_training_careerKnowledgeId_fkey" FOREIGN KEY ("careerKnowledgeId") REFERENCES "career_knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "related_careers" ADD CONSTRAINT "related_careers_careerKnowledgeId_fkey" FOREIGN KEY ("careerKnowledgeId") REFERENCES "career_knowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_assessment_options" ADD CONSTRAINT "career_assessment_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "career_assessment_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_assessment_responses" ADD CONSTRAINT "career_assessment_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_assessment_responses" ADD CONSTRAINT "career_assessment_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "career_assessment_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
