/*
  Warnings:

  - You are about to drop the `gate_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "gate_profiles" DROP CONSTRAINT "gate_profiles_userId_fkey";

-- DropTable
DROP TABLE "gate_profiles";

-- CreateTable
CREATE TABLE "gate_user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gateYear" INTEGER NOT NULL,
    "paper" TEXT NOT NULL,
    "targetScore" DOUBLE PRECISION NOT NULL,
    "weeklyHours" DOUBLE PRECISION NOT NULL,
    "preparationStage" TEXT NOT NULL,
    "examDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gate_user_profiles_userId_key" ON "gate_user_profiles"("userId");

-- CreateIndex
CREATE INDEX "gate_user_profiles_userId_idx" ON "gate_user_profiles"("userId");

-- AddForeignKey
ALTER TABLE "gate_user_profiles" ADD CONSTRAINT "gate_user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
