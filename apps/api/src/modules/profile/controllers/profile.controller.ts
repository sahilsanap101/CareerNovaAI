import type { Request, Response, NextFunction } from 'express';

import * as profileService from '@/modules/profile/services/profile.service';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@pathforge/shared-constants';
import type {
  UserSkillInput,
  UserInterestInput,
  CareerGoalInput,
  ProjectInput,
  CertificationInput,
  CodingPlatformInput,
} from '@pathforge/shared-zod';

// ─── Get Full Profile & Completion ────────────────────────────────

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.getStudentProfile(req.user!.sub);
    sendSuccess(res, { message: 'Student profile retrieved successfully.', data });
  } catch (err) {
    next(err);
  }
}

export async function getCompletion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.calculateProfileCompletion(req.user!.sub);
    sendSuccess(res, { message: 'Profile completion score calculated.', data });
  } catch (err) {
    next(err);
  }
}

// ─── Master Lists ─────────────────────────────────────────────────

export async function getSkills(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.getMasterSkills();
    sendSuccess(res, { message: 'Master skills list retrieved.', data });
  } catch (err) {
    next(err);
  }
}

export async function getInterests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.getMasterInterests();
    sendSuccess(res, { message: 'Master interests list retrieved.', data });
  } catch (err) {
    next(err);
  }
}

// ─── User Skills ──────────────────────────────────────────────────

export async function addUserSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.addUserSkill(req.user!.sub, req.body as UserSkillInput);
    sendSuccess(res, { message: 'User skill updated.', data, statusCode: HTTP_STATUS.CREATED });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserSkill(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await profileService.removeUserSkill(req.user!.sub, id);
    sendSuccess(res, { message: 'User skill removed.' });
  } catch (err) {
    next(err);
  }
}

// ─── User Interests ───────────────────────────────────────────────

export async function addUserInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.addUserInterest(req.user!.sub, req.body as UserInterestInput);
    sendSuccess(res, { message: 'User interest updated.', data, statusCode: HTTP_STATUS.CREATED });
  } catch (err) {
    next(err);
  }
}

export async function deleteUserInterest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await profileService.removeUserInterest(req.user!.sub, id);
    sendSuccess(res, { message: 'User interest removed.' });
  } catch (err) {
    next(err);
  }
}

// ─── Career Goals ─────────────────────────────────────────────────

export async function updateCareerGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.updateCareerGoals(req.user!.sub, req.body as CareerGoalInput);
    sendSuccess(res, { message: 'Career goals updated successfully.', data });
  } catch (err) {
    next(err);
  }
}

// ─── Projects ─────────────────────────────────────────────────────

export async function addProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.addProject(req.user!.sub, req.body as ProjectInput);
    sendSuccess(res, { message: 'Project added successfully.', data, statusCode: HTTP_STATUS.CREATED });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await profileService.updateProject(req.user!.sub, id, req.body as Partial<ProjectInput>);
    sendSuccess(res, { message: 'Project updated successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await profileService.removeProject(req.user!.sub, id);
    sendSuccess(res, { message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── Certifications ───────────────────────────────────────────────

export async function addCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.addCertification(req.user!.sub, req.body as CertificationInput);
    sendSuccess(res, { message: 'Certification added successfully.', data, statusCode: HTTP_STATUS.CREATED });
  } catch (err) {
    next(err);
  }
}

export async function updateCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await profileService.updateCertification(req.user!.sub, id, req.body as Partial<CertificationInput>);
    sendSuccess(res, { message: 'Certification updated successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteCertification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await profileService.removeCertification(req.user!.sub, id);
    sendSuccess(res, { message: 'Certification deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── Coding Platforms ─────────────────────────────────────────────

export async function addCodingPlatform(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await profileService.addCodingPlatform(req.user!.sub, req.body as CodingPlatformInput);
    sendSuccess(res, { message: 'Coding platform added.', data, statusCode: HTTP_STATUS.CREATED });
  } catch (err) {
    next(err);
  }
}

export async function updateCodingPlatform(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await profileService.updateCodingPlatform(req.user!.sub, id, req.body as Partial<CodingPlatformInput>);
    sendSuccess(res, { message: 'Coding platform updated.' });
  } catch (err) {
    next(err);
  }
}

export async function deleteCodingPlatform(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    await profileService.removeCodingPlatform(req.user!.sub, id);
    sendSuccess(res, { message: 'Coding platform deleted.' });
  } catch (err) {
    next(err);
  }
}
