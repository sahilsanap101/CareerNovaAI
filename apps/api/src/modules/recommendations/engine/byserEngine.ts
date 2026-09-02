import { BYSER_WEIGHTS } from '@/config/byserWeights';

export interface StudentProfileForEngine {
  id: string;
  fullName: string;
  profile: {
    cgpa?: number | null;
    degree?: string | null;
    branch?: string | null;
  } | null;
  skills: Array<{
    proficiency: number;
    experienceMonths: number;
    confidence: number;
    skill: { id: string; name: string; category: string };
  }>;
  interests: Array<{
    priority: number;
    interest: { id: string; name: string; category?: string | null };
  }>;
  careerGoal: {
    preferredJobRole?: string | null;
    preferredIndustry?: string | null;
  } | null;
  projects: Array<{
    title: string;
    description: string;
    technologies: string;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
  }>;
  codingPlatforms: Array<{
    platform: string;
    problemsSolved: number;
  }>;
}

export interface CareerPathForEngine {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  averageSalary: string;
  growthRate: string;
  demandLevel: string;
  icon?: string | null;
  color?: string | null;
  requiredSkills: Array<{
    importanceWeight: number;
    skill: { id: string; name: string; category: string };
  }>;
}

export interface FactorBreakdown {
  factor: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface EvaluationResult {
  careerPathId: string;
  careerPathName: string;
  category: string;
  averageSalary: string;
  growthRate: string;
  demandLevel: string;
  icon?: string | null;
  color?: string | null;
  totalScore: number; // 0 to 100
  SGI: number;        // Skill Gap Index 0 to 100
  sgiCategory: 'Excellent Match' | 'Good Match' | 'Moderate Gap' | 'Large Gap' | 'Critical Gap';
  confidence: number; // 0 to 100
  factors: FactorBreakdown[];
  explanation: {
    strengths: string[];
    areasToImprove: string[];
    missingSkills: Array<{
      id: string;
      name: string;
      category: string;
      importanceWeight: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  };
}

export function evaluateCareerPath(
  student: StudentProfileForEngine,
  career: CareerPathForEngine,
): EvaluationResult {
  // 1. Skills Score (35%)
  let totalRequiredWeight = 0;
  let earnedSkillWeight = 0;
  const matchedSkillNames: string[] = [];
  const missingSkills: EvaluationResult['explanation']['missingSkills'] = [];

  for (const req of career.requiredSkills) {
    totalRequiredWeight += req.importanceWeight;
    const userSkill = student.skills.find(
      (s) => s.skill.name.toLowerCase() === req.skill.name.toLowerCase(),
    );

    if (userSkill) {
      const proficiencyRatio = userSkill.proficiency / 5;
      earnedSkillWeight += req.importanceWeight * proficiencyRatio;
      matchedSkillNames.push(`${userSkill.skill.name} (${userSkill.proficiency}/5)`);
    } else {
      const priority: 'HIGH' | 'MEDIUM' | 'LOW' =
        req.importanceWeight >= 8 ? 'HIGH' : req.importanceWeight >= 5 ? 'MEDIUM' : 'LOW';
      missingSkills.push({
        id: req.skill.id,
        name: req.skill.name,
        category: req.skill.category,
        importanceWeight: req.importanceWeight,
        priority,
      });
    }
  }

  const skillScore = totalRequiredWeight > 0 ? (earnedSkillWeight / totalRequiredWeight) * 100 : 50;
  const SGI = Math.max(0, Math.min(100, Math.round(100 - skillScore)));

  let sgiCategory: EvaluationResult['sgiCategory'] = 'Critical Gap';
  if (SGI <= 20) sgiCategory = 'Excellent Match';
  else if (SGI <= 40) sgiCategory = 'Good Match';
  else if (SGI <= 60) sgiCategory = 'Moderate Gap';
  else if (SGI <= 80) sgiCategory = 'Large Gap';

  // 2. Interests Score (20%)
  const hasMatchingInterest = student.interests.some((i) =>
    i.interest.name.toLowerCase().includes(career.category.toLowerCase()) ||
    career.name.toLowerCase().includes(i.interest.name.toLowerCase()),
  );
  const interestScore = hasMatchingInterest ? 90 : student.interests.length > 0 ? 50 : 30;

  // 3. Projects Score (15%)
  const matchingProjects = student.projects.filter((p) =>
    career.requiredSkills.some((req) =>
      p.technologies.toLowerCase().includes(req.skill.name.toLowerCase()) ||
      p.description.toLowerCase().includes(req.skill.name.toLowerCase()),
    ),
  );
  const projectScore = Math.min(100, matchingProjects.length * 40);

  // 4. Academic Performance Score (10%)
  const cgpa = student.profile?.cgpa ?? 7.0;
  const academicScore = Math.min(100, (cgpa / 10) * 100);

  // 5. Certifications Score (10%)
  const certScore = Math.min(100, student.certifications.length * 35);

  // 6. Coding Experience Score (5%)
  const totalSolved = student.codingPlatforms.reduce((acc, cp) => acc + cp.problemsSolved, 0);
  const codingScore = Math.min(100, totalSolved > 0 ? Math.min(100, (totalSolved / 200) * 100) : 30);

  // 7. Career Goals Score (5%)
  const targetRole = student.careerGoal?.preferredJobRole?.toLowerCase() ?? '';
  const isGoalMatch = targetRole ? career.name.toLowerCase().includes(targetRole) || targetRole.includes(career.name.toLowerCase()) : false;
  const goalsScore = isGoalMatch ? 100 : targetRole ? 60 : 40;

  // Total Weighted BYSER Score
  const totalScore = Math.round(
    skillScore * BYSER_WEIGHTS.SKILLS +
    interestScore * BYSER_WEIGHTS.INTERESTS +
    projectScore * BYSER_WEIGHTS.PROJECTS +
    academicScore * BYSER_WEIGHTS.ACADEMIC +
    certScore * BYSER_WEIGHTS.CERTIFICATIONS +
    codingScore * BYSER_WEIGHTS.CODING +
    goalsScore * BYSER_WEIGHTS.GOALS,
  );

  const confidence = Math.round(Math.min(98, 60 + (matchedSkillNames.length * 5) + (matchingProjects.length * 6)));

  // Strengths & Explanations
  const strengths: string[] = [];
  if (matchedSkillNames.length > 0) {
    strengths.push(`Strong skills in ${matchedSkillNames.slice(0, 3).join(', ')}.`);
  }
  if (matchingProjects.length > 0) {
    strengths.push(`Completed ${matchingProjects.length} relevant project(s) matching this path.`);
  }
  if (hasMatchingInterest) {
    strengths.push(`High domain interest aligned with ${career.category}.`);
  }
  if (academicScore >= 80) {
    strengths.push(`Strong academic standing (CGPA ${cgpa.toFixed(1)}/10).`);
  }
  if (strengths.length === 0) {
    strengths.push('Good foundational engineering baseline for career growth.');
  }

  const areasToImprove: string[] = [];
  if (missingSkills.length > 0) {
    const highPriorityMissing = missingSkills.filter((m) => m.priority === 'HIGH').map((m) => m.name);
    if (highPriorityMissing.length > 0) {
      areasToImprove.push(`Acquire core missing skills: ${highPriorityMissing.join(', ')}.`);
    }
  }
  if (matchingProjects.length === 0) {
    areasToImprove.push(`Build at least one hands-on project focused on ${career.name}.`);
  }
  if (student.certifications.length === 0) {
    areasToImprove.push(`Consider earning an industry-recognized certification in ${career.category}.`);
  }

  const factors: FactorBreakdown[] = [
    { factor: 'Skills', weight: BYSER_WEIGHTS.SKILLS, score: Math.round(skillScore), explanation: matchedSkillNames.length > 0 ? `Matched ${matchedSkillNames.length} skill(s)` : 'No skills matched yet' },
    { factor: 'Interests', weight: BYSER_WEIGHTS.INTERESTS, score: Math.round(interestScore), explanation: hasMatchingInterest ? 'High domain interest alignment' : 'Moderate domain alignment' },
    { factor: 'Projects', weight: BYSER_WEIGHTS.PROJECTS, score: Math.round(projectScore), explanation: `${matchingProjects.length} relevant portfolio project(s)` },
    { factor: 'Academic', weight: BYSER_WEIGHTS.ACADEMIC, score: Math.round(academicScore), explanation: `CGPA ${cgpa.toFixed(1)}/10` },
    { factor: 'Certifications', weight: BYSER_WEIGHTS.CERTIFICATIONS, score: Math.round(certScore), explanation: `${student.certifications.length} active certification(s)` },
    { factor: 'Coding Experience', weight: BYSER_WEIGHTS.CODING, score: Math.round(codingScore), explanation: `${totalSolved} problem(s) solved across platforms` },
    { factor: 'Career Goals', weight: BYSER_WEIGHTS.GOALS, score: Math.round(goalsScore), explanation: isGoalMatch ? 'Direct target role match' : 'General engineering career goal' },
  ];

  return {
    careerPathId: career.id,
    careerPathName: career.name,
    category: career.category,
    averageSalary: career.averageSalary,
    growthRate: career.growthRate,
    demandLevel: career.demandLevel,
    icon: career.icon,
    color: career.color,
    totalScore,
    SGI,
    sgiCategory,
    confidence,
    factors,
    explanation: {
      strengths,
      areasToImprove,
      missingSkills,
    },
  };
}
