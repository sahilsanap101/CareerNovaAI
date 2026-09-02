-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('light', 'dark', 'system');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'hi');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New AI Session',
    "agentType" TEXT NOT NULL DEFAULT 'CAREER_MENTOR',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sources" JSONB,
    "tokensUsed" INTEGER DEFAULT 0,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_metrics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
    "tokensInput" INTEGER NOT NULL DEFAULT 0,
    "tokensOutput" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_docs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'CAREER_GUIDE',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_docs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "careerPathId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "estimatedDuration" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_phases" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "phaseNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedWeeks" INTEGER NOT NULL DEFAULT 4,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_modules" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "estimatedHours" INTEGER NOT NULL DEFAULT 10,
    "requiredSkills" TEXT[],
    "providedSkills" TEXT[],
    "dependencies" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "roadmap_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_tasks" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "taskType" TEXT NOT NULL DEFAULT 'PRACTICE',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 60,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "priority" TEXT NOT NULL DEFAULT 'HIGH',
    "deadline" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "learning_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL DEFAULT 'VIDEO',
    "duration" TEXT DEFAULT '30 mins',
    "language" TEXT NOT NULL DEFAULT 'English',
    "difficulty" TEXT NOT NULL DEFAULT 'BEGINNER',
    "free" BOOLEAN NOT NULL DEFAULT true,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roadmaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "learningPace" TEXT NOT NULL DEFAULT 'MEDIUM',
    "currentPhase" INTEGER NOT NULL DEFAULT 1,
    "currentModule" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "user_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "completedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_plans" (
    "id" TEXT NOT NULL,
    "weeklyPlanId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "tasks" JSONB NOT NULL,
    "estimatedHours" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "completedHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',

    CONSTRAINT "daily_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "reward" TEXT DEFAULT 'Badge',

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Trophy',
    "badgeColor" TEXT NOT NULL DEFAULT 'gold',
    "criteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "study_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL DEFAULT 0,
    "module" TEXT,

    CONSTRAINT "study_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_paths" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT 'Technology',
    "averageSalary" TEXT NOT NULL,
    "growthRate" TEXT NOT NULL,
    "demandLevel" TEXT NOT NULL DEFAULT 'HIGH',
    "roadmapId" TEXT,
    "icon" TEXT DEFAULT 'Briefcase',
    "color" TEXT DEFAULT 'blue',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "required_skills" (
    "id" TEXT NOT NULL,
    "careerPathId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "importanceWeight" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "required_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "careerPathId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "SGI" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "explanation" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_factors" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "factor" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,

    CONSTRAINT "recommendation_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "college" TEXT,
    "university" TEXT,
    "degree" TEXT,
    "branch" TEXT,
    "specialization" TEXT,
    "currentYear" INTEGER,
    "currentSemester" INTEGER,
    "graduationYear" INTEGER,
    "cgpa" DOUBLE PRECISION,
    "bio" TEXT,
    "profileImage" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'India',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" "Theme" NOT NULL DEFAULT 'system',
    "language" "Language" NOT NULL DEFAULT 'en',
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 1,
    "experienceMonths" INTEGER NOT NULL DEFAULT 0,
    "confidence" INTEGER NOT NULL DEFAULT 50,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferredJobRole" TEXT,
    "preferredIndustry" TEXT,
    "preferredWorkMode" "WorkMode" NOT NULL DEFAULT 'HYBRID',
    "preferredCountries" TEXT,
    "expectedSalary" TEXT,
    "higherStudies" BOOLEAN NOT NULL DEFAULT false,
    "entrepreneurship" BOOLEAN NOT NULL DEFAULT false,
    "governmentJobs" BOOLEAN NOT NULL DEFAULT false,
    "startup" BOOLEAN NOT NULL DEFAULT false,
    "research" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "technologies" TEXT NOT NULL,
    "githubUrl" TEXT,
    "demoUrl" TEXT,
    "completionStatus" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TEXT,
    "credentialUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coding_platforms" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "problemsSolved" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coding_platforms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "device" TEXT,
    "browser" TEXT,
    "ip" TEXT,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "conversations_userId_idx" ON "conversations"("userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_name_key" ON "prompt_templates"("name");

-- CreateIndex
CREATE INDEX "ai_metrics_userId_idx" ON "ai_metrics"("userId");

-- CreateIndex
CREATE INDEX "knowledge_docs_category_idx" ON "knowledge_docs"("category");

-- CreateIndex
CREATE INDEX "roadmaps_careerPathId_idx" ON "roadmaps"("careerPathId");

-- CreateIndex
CREATE INDEX "roadmap_phases_roadmapId_idx" ON "roadmap_phases"("roadmapId");

-- CreateIndex
CREATE INDEX "roadmap_modules_phaseId_idx" ON "roadmap_modules"("phaseId");

-- CreateIndex
CREATE INDEX "learning_tasks_moduleId_idx" ON "learning_tasks"("moduleId");

-- CreateIndex
CREATE INDEX "resources_taskId_idx" ON "resources"("taskId");

-- CreateIndex
CREATE INDEX "user_roadmaps_userId_idx" ON "user_roadmaps"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_roadmaps_userId_roadmapId_key" ON "user_roadmaps"("userId", "roadmapId");

-- CreateIndex
CREATE INDEX "user_tasks_userId_idx" ON "user_tasks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_tasks_userId_taskId_key" ON "user_tasks"("userId", "taskId");

-- CreateIndex
CREATE INDEX "weekly_plans_userId_idx" ON "weekly_plans"("userId");

-- CreateIndex
CREATE INDEX "daily_plans_weeklyPlanId_idx" ON "daily_plans"("weeklyPlanId");

-- CreateIndex
CREATE INDEX "milestones_roadmapId_idx" ON "milestones"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_title_key" ON "achievements"("title");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE INDEX "study_sessions_userId_idx" ON "study_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "career_paths_name_key" ON "career_paths"("name");

-- CreateIndex
CREATE INDEX "career_paths_category_idx" ON "career_paths"("category");

-- CreateIndex
CREATE INDEX "required_skills_careerPathId_idx" ON "required_skills"("careerPathId");

-- CreateIndex
CREATE UNIQUE INDEX "required_skills_careerPathId_skillId_key" ON "required_skills"("careerPathId", "skillId");

-- CreateIndex
CREATE INDEX "recommendation_results_userId_idx" ON "recommendation_results"("userId");

-- CreateIndex
CREATE INDEX "recommendation_results_careerPathId_idx" ON "recommendation_results"("careerPathId");

-- CreateIndex
CREATE INDEX "recommendation_results_generatedAt_idx" ON "recommendation_results"("generatedAt");

-- CreateIndex
CREATE INDEX "recommendation_factors_recommendationId_idx" ON "recommendation_factors"("recommendationId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_userId_idx" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skills_category_idx" ON "skills"("category");

-- CreateIndex
CREATE INDEX "user_skills_userId_idx" ON "user_skills"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_userId_skillId_key" ON "user_skills"("userId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "interests_name_key" ON "interests"("name");

-- CreateIndex
CREATE INDEX "user_interests_userId_idx" ON "user_interests"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_interests_userId_interestId_key" ON "user_interests"("userId", "interestId");

-- CreateIndex
CREATE UNIQUE INDEX "career_goals_userId_key" ON "career_goals"("userId");

-- CreateIndex
CREATE INDEX "career_goals_userId_idx" ON "career_goals"("userId");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "certifications_userId_idx" ON "certifications"("userId");

-- CreateIndex
CREATE INDEX "coding_platforms_userId_idx" ON "coding_platforms"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_refreshToken_idx" ON "sessions"("refreshToken");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_userId_idx" ON "verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "verification_tokens_token_idx" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_metrics" ADD CONSTRAINT "ai_metrics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_careerPathId_fkey" FOREIGN KEY ("careerPathId") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_phases" ADD CONSTRAINT "roadmap_phases_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_modules" ADD CONSTRAINT "roadmap_modules_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "roadmap_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_tasks" ADD CONSTRAINT "learning_tasks_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "roadmap_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "learning_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tasks" ADD CONSTRAINT "user_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "learning_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_plans" ADD CONSTRAINT "weekly_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_plans" ADD CONSTRAINT "daily_plans_weeklyPlanId_fkey" FOREIGN KEY ("weeklyPlanId") REFERENCES "weekly_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "study_sessions" ADD CONSTRAINT "study_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "required_skills" ADD CONSTRAINT "required_skills_careerPathId_fkey" FOREIGN KEY ("careerPathId") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "required_skills" ADD CONSTRAINT "required_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_results" ADD CONSTRAINT "recommendation_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_results" ADD CONSTRAINT "recommendation_results_careerPathId_fkey" FOREIGN KEY ("careerPathId") REFERENCES "career_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendation_factors" ADD CONSTRAINT "recommendation_factors_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "recommendation_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_goals" ADD CONSTRAINT "career_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coding_platforms" ADD CONSTRAINT "coding_platforms_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
