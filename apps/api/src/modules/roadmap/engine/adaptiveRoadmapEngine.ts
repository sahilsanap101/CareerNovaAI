import { normalizeSkillName } from '@pathforge/shared-constants';
import * as fs from 'fs';
import * as path from 'path';
import { getPrerequisiteChain } from './skillDependencyEngine';

export interface GeneratedPhaseData {
  phaseNumber: number;
  title: string;
  description: string;
  estimatedWeeks: number;
  modules: Array<{
    title: string;
    description: string;
    difficulty: string;
    estimatedHours: number;
    requiredSkills: string[];
    providedSkills: string[];
    tasks: Array<{
      title: string;
      description: string;
      taskType: 'THEORY' | 'PRACTICE' | 'PROJECT' | 'QUIZ' | 'REVISION';
      estimatedMinutes: number;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
      resources: Array<{
        title: string;
        provider: string;
        url: string;
        resourceType: 'VIDEO' | 'ARTICLE' | 'DOCUMENTATION' | 'COURSE';
        duration: string;
        free: boolean;
        rating: number;
      }> | 'resource_curation_pending';
    }>;
  }>;
}

let CURATED_RESOURCES: Record<string, any> = {};
try {
  const possiblePaths = [
    path.join(__dirname, '../../../../../../apps/api/src/data/curated_resources.json'), // from dist
    path.join(process.cwd(), 'apps/api/src/data/curated_resources.json'), // from workspace root
    path.join(process.cwd(), '../../apps/api/src/data/curated_resources.json'), // from apps/api
    path.join(process.cwd(), 'src/data/curated_resources.json'), // failsafe
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      CURATED_RESOURCES = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    }
  }
} catch (error) {
  console.warn('Failed to load curated resources dynamically.', error);
}

function getCuratedResources(skillName: string) {
  const normTarget = normalizeSkillName(skillName);
  const data = CURATED_RESOURCES[normTarget];

  if (data && data.resources && data.resources.length > 0) {
    return data.resources.map((r: any) => ({
      title: r.title,
      provider: r.source,
      url: r.url,
      resourceType: r.type === 'official_documentation' ? 'DOCUMENTATION' : 'ARTICLE',
      duration: 'Variable',
      free: true,
      rating: 4.8
    }));
  }
  return 'resource_curation_pending';
}

export function buildAdaptiveRoadmapTree(
  careerPathName: string,
  requiredSkills: string[],
  userSkills: Array<{ name: string; proficiency: number }>,
  learningPace: 'FAST' | 'MEDIUM' | 'SLOW' = 'MEDIUM',
): GeneratedPhaseData[] {
  const orderedSkills = getPrerequisiteChain(requiredSkills);

  // Filter out already mastered skills (proficiency >= 4)
  const skillsToLearn = orderedSkills.filter((sName) => {
    const uSkill = userSkills.find((u) => u.name.toLowerCase() === sName.toLowerCase());
    return !uSkill || uSkill.proficiency < 4;
  });

  const paceMultiplier = learningPace === 'FAST' ? 0.75 : learningPace === 'SLOW' ? 1.5 : 1.0;

  // Phase 1: Foundations
  const phase1Skills = skillsToLearn.slice(0, Math.ceil(skillsToLearn.length * 0.4));
  // Phase 2: Core Engineering
  const phase2Skills = skillsToLearn.slice(Math.ceil(skillsToLearn.length * 0.4), Math.ceil(skillsToLearn.length * 0.75));
  // Phase 3: Advanced Architecture & Projects
  const phase3Skills = skillsToLearn.slice(Math.ceil(skillsToLearn.length * 0.75));

  const phases: GeneratedPhaseData[] = [
    {
      phaseNumber: 1,
      title: `Phase 1: ${careerPathName} Fundamentals`,
      description: 'Master foundational prerequisites and core syntax.',
      estimatedWeeks: Math.round(4 * paceMultiplier),
      modules: (phase1Skills.length > 0 ? phase1Skills : ['Core Basics']).map((skill, idx) => ({
        title: `${skill} Essentials`,
        description: `Foundational concepts, architecture, and syntax of ${skill}.`,
        difficulty: 'BEGINNER',
        estimatedHours: 10,
        requiredSkills: idx > 0 && phase1Skills[idx - 1] ? [phase1Skills[idx - 1]!] : [],
        providedSkills: [skill],
        tasks: [
          {
            title: `Study ${skill} Syntax & Theory`,
            description: `Understand core paradigms and data structures in ${skill}.`,
            taskType: 'THEORY',
            estimatedMinutes: 90,
            priority: 'HIGH',
            resources: getCuratedResources(skill),
          },
          {
            title: `Build Mini Practice Exercises in ${skill}`,
            description: `Solve 5 algorithmic challenges using ${skill}.`,
            taskType: 'PRACTICE',
            estimatedMinutes: 120,
            priority: 'HIGH',
            resources: getCuratedResources(skill),
          },
        ],
      })),
    },
    {
      phaseNumber: 2,
      title: `Phase 2: Core ${careerPathName} Engineering`,
      description: 'Deep dive into frameworks, databases, and microservices.',
      estimatedWeeks: Math.round(6 * paceMultiplier),
      modules: (phase2Skills.length > 0 ? phase2Skills : ['Advanced Concepts']).map((skill) => ({
        title: `${skill} In-Depth Engineering`,
        description: `Production-grade design patterns and state management with ${skill}.`,
        difficulty: 'INTERMEDIATE',
        estimatedHours: 15,
        requiredSkills: phase1Skills,
        providedSkills: [skill],
        tasks: [
          {
            title: `Architect ${skill} Application Modules`,
            description: `Implement modular code structure and error handling.`,
            taskType: 'PRACTICE',
            estimatedMinutes: 150,
            priority: 'HIGH',
            resources: getCuratedResources(skill),
          },
        ],
      })),
    },
    {
      phaseNumber: 3,
      title: `Phase 3: Portfolio Capstone & Production Readiness`,
      description: 'Build end-to-end production applications and prepare for technical interviews.',
      estimatedWeeks: Math.round(4 * paceMultiplier),
      modules: [
        {
          title: `Full Stack ${careerPathName} Capstone Project`,
          description: `Design and deploy a full-scale portfolio project demonstrating ${careerPathName} mastery.`,
          difficulty: 'ADVANCED',
          estimatedHours: 25,
          requiredSkills: [...phase1Skills, ...phase2Skills],
          providedSkills: [`${careerPathName} Capstone`],
          tasks: [
            {
              title: `Deploy ${careerPathName} Portfolio Capstone to Cloud`,
              description: 'Configure CI/CD pipelines, SSL certificates, and environment variables.',
              taskType: 'PROJECT',
              estimatedMinutes: 240,
              priority: 'HIGH',
              resources: getCuratedResources(careerPathName),
            },
          ],
        },
      ],
    },
  ];

  return phases;
}

export function calculateCareerReadinessScore(
  userSkillsCount: number,
  avgProficiency: number,
  projectsCount: number,
  certificationsCount: number,
  roadmapCompletion: number,
): number {
  const skillScore = (avgProficiency / 5) * 40;       // Max 40
  const projectScore = Math.min(25, projectsCount * 8.5); // Max 25
  const certScore = Math.min(15, certificationsCount * 7.5); // Max 15
  const roadmapScore = (roadmapCompletion / 100) * 20; // Max 20

  return Math.min(100, Math.round(skillScore + projectScore + certScore + roadmapScore));
}
