import { Router } from 'express';

import * as profileController from '@/modules/profile/controllers/profile.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import {
  userSkillSchema,
  userInterestSchema,
  careerGoalSchema,
  projectSchema,
  certificationSchema,
  codingPlatformSchema,
} from '@pathforge/shared-zod';

const router = Router();

// All profile endpoints require authentication
router.use(authenticate);

// ─── Master Lists ─────────────────────────────────────────────────
router.get('/skills/master', profileController.getSkills);
router.get('/interests/master', profileController.getInterests);

// ─── Profile & Completion ─────────────────────────────────────────
router.get('/', profileController.getProfile);
router.get('/completion', profileController.getCompletion);

// ─── User Skills ──────────────────────────────────────────────────
router.post('/skills', validate(userSkillSchema), profileController.addUserSkill);
router.put('/skills', validate(userSkillSchema), profileController.addUserSkill);
router.delete('/skills/:id', profileController.deleteUserSkill);

// ─── User Interests ───────────────────────────────────────────────
router.post('/interests', validate(userInterestSchema), profileController.addUserInterest);
router.delete('/interests/:id', profileController.deleteUserInterest);

// ─── Career Goals ─────────────────────────────────────────────────
router.get('/career-goals', profileController.getProfile);
router.put('/career-goals', validate(careerGoalSchema), profileController.updateCareerGoals);

// ─── Projects (CRUD) ──────────────────────────────────────────────
router.post('/projects', validate(projectSchema), profileController.addProject);
router.put('/projects/:id', profileController.updateProject);
router.delete('/projects/:id', profileController.deleteProject);

// ─── Certifications (CRUD) ────────────────────────────────────────
router.post('/certifications', validate(certificationSchema), profileController.addCertification);
router.put('/certifications/:id', profileController.updateCertification);
router.delete('/certifications/:id', profileController.deleteCertification);

// ─── Coding Platforms (CRUD) ──────────────────────────────────────
router.post('/coding-platforms', validate(codingPlatformSchema), profileController.addCodingPlatform);
router.put('/coding-platforms/:id', profileController.updateCodingPlatform);
router.delete('/coding-platforms/:id', profileController.deleteCodingPlatform);

export default router;
