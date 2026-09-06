import * as recRepo from '@/modules/recommendations/repositories/recommendation.repository';
import { getFullStudentData } from '@/modules/profile/repositories/profile.repository';
import { evaluateCareerPath, type EvaluationResult } from '../engine/byserEngine';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';

// ─── Generate Recommendations ─────────────────────────────────────

export async function generateRecommendations(userId: string) {
  const student = await getFullStudentData(userId);
  if (!student) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  const careerPaths = await recRepo.getAllCareerPathsWithSkills();
  if (careerPaths.length === 0) {
    throw new AppError('No career paths configured', HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_CODES.SERVER_001);
  }

  // Evaluate every career path
  const evaluated = careerPaths.map((career) => evaluateCareerPath(student, career));

  // Sort by Total Score descending
  evaluated.sort((a, b) => b.totalScore - a.totalScore);

  // Take Top 5 recommendations
  const top5 = evaluated.slice(0, 5);

  // Save in database
  const savedRecords = await recRepo.saveRecommendations(
    userId,
    top5.map((rec) => ({
      careerPathId: rec.careerPathId,
      totalScore: rec.totalScore,
      SGI: rec.SGI,
      confidence: rec.confidence,
      explanation: rec.explanation as unknown as import('@prisma/client').Prisma.InputJsonValue,
      factors: rec.factors,
    })),
  );

  return savedRecords;
}

// ─── Get Recommendations ──────────────────────────────────────────

export async function getLatestUserRecommendations(userId: string) {
  let recs = await recRepo.getLatestRecommendations(userId);
  if (recs.length === 0) {
    // Auto-generate if not yet run
    const generated = await generateRecommendations(userId);
    return generated;
  }
  return recs;
}

export async function getUserRecommendationHistory(userId: string) {
  return recRepo.getRecommendationHistory(userId);
}

// ─── Career Paths & Comparison ────────────────────────────────────

export async function getAllCareerPaths() {
  return recRepo.getAllCareerPathsWithSkills();
}

export async function getCareerPathDetails(id: string) {
  const career = await recRepo.getCareerPathById(id);
  if (!career) {
    throw new AppError('Career path not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }
  return career;
}

export async function compareCareerPaths(userId: string, careerPathIds: string[]) {
  const student = await getFullStudentData(userId);
  if (!student) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  const comparisons = [];
  for (const id of careerPathIds) {
    const career = await recRepo.getCareerPathById(id);
    if (career) {
      const result = evaluateCareerPath(student, career);
      comparisons.push({
        careerPath: career,
        evaluation: result,
      });
    }
  }

  return comparisons;
}

// ─── Analytics Engine ─────────────────────────────────────────────

export async function getStudentAnalytics(userId: string) {
  const student = await getFullStudentData(userId);
  if (!student) {
    throw new AppError('Student profile not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.USER_001);
  }

  // 1. Skill Category Distribution
  const skillCategories: Record<string, number> = {};
  student.skills.forEach((s) => {
    const cat = s.skill.category;
    skillCategories[cat] = (skillCategories[cat] || 0) + 1;
  });

  // 2. Skill Strengths vs Weak Areas
  const strengths = student.skills.filter((s) => s.proficiency >= 4).map((s) => s.skill.name);
  const weakAreas = student.skills.filter((s) => s.proficiency <= 2).map((s) => s.skill.name);

  // 3. Project Tech Stack Distribution
  const projectTech: Record<string, number> = {};
  student.projects.forEach((p) => {
    p.technologies.split(',').forEach((t) => {
      const clean = t.trim();
      if (clean) projectTech[clean] = (projectTech[clean] || 0) + 1;
    });
  });

  // 4. Overall Student Readiness Score
  const totalSkills = student.skills.length;
  const avgProficiency = totalSkills > 0 ? student.skills.reduce((a, b) => a + b.proficiency, 0) / totalSkills : 0;
  const readinessScore = Math.min(100, Math.round((avgProficiency / 5) * 60 + Math.min(40, student.projects.length * 10)));

  return {
    readinessScore,
    totalSkillsCount: totalSkills,
    projectsCount: student.projects.length,
    certificationsCount: student.certifications.length,
    skillCategories: Object.entries(skillCategories).map(([category, count]) => ({ category, count })),
    strengths,
    weakAreas,
    projectTechDistribution: Object.entries(projectTech).map(([technology, count]) => ({ technology, count })),
    interestsList: student.interests.map((i) => i.interest.name),
  };
}
