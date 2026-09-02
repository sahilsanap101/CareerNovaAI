import * as profileRepo from '@/modules/profile/repositories/profile.repository';
import { updateUserProfile } from '@/modules/users/repositories/user.repository';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';
import type {
  UpdateProfileInput,
  UserSkillInput,
  UserInterestInput,
  CareerGoalInput,
  ProjectInput,
  CertificationInput,
  CodingPlatformInput,
} from '@pathforge/shared-zod';

// ─── Get Full Student Data ────────────────────────────────────────

export async function getStudentProfile(userId: string) {
  const data = await profileRepo.getFullStudentData(userId);
  if (!data) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }
  return data;
}

// ─── Calculate Completion Score ──────────────────────────────────

export async function calculateProfileCompletion(userId: string) {
  const student = await profileRepo.getFullStudentData(userId);
  if (!student) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  const profile = student.profile;
  const missingSections: string[] = [];
  let score = 0;

  // 1. Personal Info (20%)
  const hasPersonal = Boolean(student.fullName && profile?.bio && profile?.profileImage);
  if (hasPersonal) {
    score += 20;
  } else {
    missingSections.push('Personal Information');
  }

  // 2. Academic Info (20%)
  const hasAcademic = Boolean(profile?.college && profile?.degree && profile?.branch && profile?.cgpa);
  if (hasAcademic) {
    score += 20;
  } else {
    missingSections.push('Academic Information');
  }

  // 3. Skills (20%)
  if (student.skills.length > 0) {
    score += 20;
  } else {
    missingSections.push('Skills');
  }

  // 4. Interests (10%)
  if (student.interests.length > 0) {
    score += 10;
  } else {
    missingSections.push('Interests');
  }

  // 5. Projects (10%)
  if (student.projects.length > 0) {
    score += 10;
  } else {
    missingSections.push('Projects');
  }

  // 6. Certifications (10%)
  if (student.certifications.length > 0) {
    score += 10;
  } else {
    missingSections.push('Certifications');
  }

  // 7. Career Goals (10%)
  const goal = student.careerGoal;
  const hasCareerGoal = Boolean(goal && (goal.preferredJobRole || goal.preferredIndustry));
  if (hasCareerGoal) {
    score += 10;
  } else {
    missingSections.push('Career Goals');
  }

  return {
    completionPercentage: Math.min(100, score),
    missingSections,
    breakdown: {
      personal: hasPersonal ? 20 : 0,
      academic: hasAcademic ? 20 : 0,
      skills: student.skills.length > 0 ? 20 : 0,
      interests: student.interests.length > 0 ? 10 : 0,
      projects: student.projects.length > 0 ? 10 : 0,
      certifications: student.certifications.length > 0 ? 10 : 0,
      careerGoals: hasCareerGoal ? 10 : 0,
    },
  };
}

// ─── Master Lists ─────────────────────────────────────────────────

export async function getMasterSkills() {
  return profileRepo.getAllMasterSkills();
}

export async function getMasterInterests() {
  return profileRepo.getAllMasterInterests();
}

// ─── User Skills ──────────────────────────────────────────────────

export async function addUserSkill(userId: string, input: UserSkillInput) {
  return profileRepo.upsertUserSkill({ userId, ...input });
}

export async function removeUserSkill(userId: string, userSkillId: string) {
  return profileRepo.deleteUserSkill(userId, userSkillId);
}

// ─── User Interests ───────────────────────────────────────────────

export async function addUserInterest(userId: string, input: UserInterestInput) {
  return profileRepo.upsertUserInterest({ userId, ...input });
}

export async function removeUserInterest(userId: string, userInterestId: string) {
  return profileRepo.deleteUserInterest(userId, userInterestId);
}

// ─── Career Goals ─────────────────────────────────────────────────

export async function updateCareerGoals(userId: string, input: CareerGoalInput) {
  return profileRepo.upsertCareerGoal(userId, input);
}

// ─── Projects CRUD ────────────────────────────────────────────────

export async function addProject(userId: string, input: ProjectInput) {
  return profileRepo.createProject(userId, {
    title: input.title,
    description: input.description,
    technologies: input.technologies,
    githubUrl: input.githubUrl ?? null,
    demoUrl: input.demoUrl ?? null,
    completionStatus: input.completionStatus,
  });
}

export async function updateProject(userId: string, projectId: string, input: Partial<ProjectInput>) {
  return profileRepo.updateProject(userId, projectId, input);
}

export async function removeProject(userId: string, projectId: string) {
  return profileRepo.deleteProject(userId, projectId);
}

// ─── Certifications CRUD ──────────────────────────────────────────

export async function addCertification(userId: string, input: CertificationInput) {
  return profileRepo.createCertification(userId, {
    title: input.title,
    issuer: input.issuer,
    issueDate: input.issueDate ?? null,
    credentialUrl: input.credentialUrl ?? null,
  });
}

export async function updateCertification(userId: string, certId: string, input: Partial<CertificationInput>) {
  return profileRepo.updateCertification(userId, certId, input);
}

export async function removeCertification(userId: string, certId: string) {
  return profileRepo.deleteCertification(userId, certId);
}

// ─── Coding Platforms CRUD ────────────────────────────────────────

export async function addCodingPlatform(userId: string, input: CodingPlatformInput) {
  return profileRepo.createCodingPlatform(userId, input);
}

export async function updateCodingPlatform(userId: string, platformId: string, input: Partial<CodingPlatformInput>) {
  return profileRepo.updateCodingPlatform(userId, platformId, input);
}

export async function removeCodingPlatform(userId: string, platformId: string) {
  return profileRepo.deleteCodingPlatform(userId, platformId);
}
