-- CreateTable
CREATE TABLE "gate_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gateYear" INTEGER NOT NULL,
    "paper" TEXT NOT NULL,
    "targetScore" INTEGER,
    "weeklyHours" INTEGER,
    "preparationStage" TEXT NOT NULL,
    "examDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gate_profiles_userId_key" ON "gate_profiles"("userId");

-- CreateIndex
CREATE INDEX "gate_profiles_userId_idx" ON "gate_profiles"("userId");

-- AddForeignKey
ALTER TABLE "gate_profiles" ADD CONSTRAINT "gate_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
