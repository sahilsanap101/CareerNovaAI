import { prisma } from '@/config/database';
import type { Prisma } from '@prisma/client';

// ─── Profile & Full Student Data ──────────────────────────────────

export async function getFullStudentData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      isVerified: true,
      profile: true,
      preferences: true,
      skills: {
        include: { skill: true },
        orderBy: { confidence: 'desc' },
      },
      interests: {
        include: { interest: true },
        orderBy: { priority: 'desc' },
      },
      careerGoal: true,
      projects: {
        orderBy: { createdAt: 'desc' },
      },
      certifications: {
        orderBy: { createdAt: 'desc' },
      },
      codingPlatforms: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

// ─── Master Lists ─────────────────────────────────────────────────

export async function getAllMasterSkills() {
  return prisma.skill.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });
}

export async function getAllMasterInterests() {
  return prisma.interest.findMany({
    orderBy: { name: 'asc' },
  });
}

// ─── User Skills ──────────────────────────────────────────────────

export async function upsertUserSkill(data: {
  userId: string;
  skillId: string;
  proficiency: number;
  experienceMonths: number;
  confidence: number;
}) {
  return prisma.userSkill.upsert({
    where: {
      userId_skillId: {
        userId: data.userId,
        skillId: data.skillId,
      },
    },
    update: {
      proficiency: data.proficiency,
      experienceMonths: data.experienceMonths,
      confidence: data.confidence,
    },
    create: data,
    include: { skill: true },
  });
}

export async function deleteUserSkill(userId: string, userSkillId: string) {
  return prisma.userSkill.deleteMany({
    where: {
      id: userSkillId,
      userId,
    },
  });
}

// ─── User Interests ───────────────────────────────────────────────

export async function upsertUserInterest(data: {
  userId: string;
  interestId: string;
  priority: number;
}) {
  return prisma.userInterest.upsert({
    where: {
      userId_interestId: {
        userId: data.userId,
        interestId: data.interestId,
      },
    },
    update: {
      priority: data.priority,
    },
    create: data,
    include: { interest: true },
  });
}

export async function deleteUserInterest(userId: string, userInterestId: string) {
  return prisma.userInterest.deleteMany({
    where: {
      id: userInterestId,
      userId,
    },
  });
}

// ─── Career Goals ─────────────────────────────────────────────────

export async function upsertCareerGoal(userId: string, data: Prisma.CareerGoalCreateWithoutUserInput) {
  return prisma.careerGoal.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  });
}

export async function getCareerGoal(userId: string) {
  return prisma.careerGoal.findUnique({
    where: { userId },
  });
}

// ─── Projects ─────────────────────────────────────────────────────

export async function createProject(userId: string, data: Prisma.ProjectCreateWithoutUserInput) {
  return prisma.project.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function updateProject(userId: string, projectId: string, data: Prisma.ProjectUpdateInput) {
  return prisma.project.updateMany({
    where: { id: projectId, userId },
    data,
  });
}

export async function deleteProject(userId: string, projectId: string) {
  return prisma.project.deleteMany({
    where: { id: projectId, userId },
  });
}

// ─── Certifications ───────────────────────────────────────────────

export async function createCertification(userId: string, data: Prisma.CertificationCreateWithoutUserInput) {
  return prisma.certification.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function updateCertification(userId: string, certId: string, data: Prisma.CertificationUpdateInput) {
  return prisma.certification.updateMany({
    where: { id: certId, userId },
    data,
  });
}

export async function deleteCertification(userId: string, certId: string) {
  return prisma.certification.deleteMany({
    where: { id: certId, userId },
  });
}

// ─── Coding Platforms ─────────────────────────────────────────────

export async function createCodingPlatform(userId: string, data: Prisma.CodingPlatformCreateWithoutUserInput) {
  return prisma.codingPlatform.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function updateCodingPlatform(userId: string, platformId: string, data: Prisma.CodingPlatformUpdateInput) {
  return prisma.codingPlatform.updateMany({
    where: { id: platformId, userId },
    data,
  });
}

export async function deleteCodingPlatform(userId: string, platformId: string) {
  return prisma.codingPlatform.deleteMany({
    where: { id: platformId, userId },
  });
}
