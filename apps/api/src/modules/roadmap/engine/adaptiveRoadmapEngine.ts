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
      }>;
    }>;
  }>;
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
            resources: [
              {
                title: `${skill} Official Documentation`,
                provider: 'Official Docs',
                url: `https://developer.mozilla.org/search?q=${encodeURIComponent(skill)}`,
                resourceType: 'DOCUMENTATION',
                duration: '45 mins',
                free: true,
                rating: 4.9,
              },
              {
                title: `Full ${skill} Course for Beginners`,
                provider: 'freeCodeCamp',
                url: `https://www.youtube.com/results?search_query=freecodecamp+${encodeURIComponent(skill)}`,
                resourceType: 'VIDEO',
                duration: '2 hours',
                free: true,
                rating: 4.8,
              },
            ],
          },
          {
            title: `Build Mini Practice Exercises in ${skill}`,
            description: `Solve 5 algorithmic challenges using ${skill}.`,
            taskType: 'PRACTICE',
            estimatedMinutes: 120,
            priority: 'HIGH',
            resources: [
              {
                title: `${skill} Practice Exercises`,
                provider: 'GitHub',
                url: `https://github.com/topics/${encodeURIComponent(skill.toLowerCase())}`,
                resourceType: 'ARTICLE',
                duration: '60 mins',
                free: true,
                rating: 4.7,
              },
            ],
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
            resources: [
              {
                title: `Mastering ${skill} Architecture`,
                provider: 'Coursera',
                url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
                resourceType: 'COURSE',
                duration: '3 hours',
                free: true,
                rating: 4.8,
              },
            ],
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
              resources: [
                {
                  title: 'Cloud Deployment Guide',
                  provider: 'AWS Skill Builder',
                  url: 'https://explore.skillbuilder.aws/',
                  resourceType: 'DOCUMENTATION',
                  duration: '2 hours',
                  free: true,
                  rating: 4.9,
                },
              ],
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
