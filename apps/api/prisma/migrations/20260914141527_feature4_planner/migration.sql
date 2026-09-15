-- CreateTable
CREATE TABLE "gate_study_tasks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_study_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gate_study_tasks_userId_idx" ON "gate_study_tasks"("userId");

-- CreateIndex
CREATE INDEX "gate_study_tasks_topicId_idx" ON "gate_study_tasks"("topicId");

-- AddForeignKey
ALTER TABLE "gate_study_tasks" ADD CONSTRAINT "gate_study_tasks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_study_tasks" ADD CONSTRAINT "gate_study_tasks_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "gate_personal_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
