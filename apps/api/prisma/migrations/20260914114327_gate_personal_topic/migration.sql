-- CreateTable
CREATE TABLE "gate_personal_topics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_personal_topics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gate_personal_topics_userId_idx" ON "gate_personal_topics"("userId");

-- AddForeignKey
ALTER TABLE "gate_personal_topics" ADD CONSTRAINT "gate_personal_topics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
