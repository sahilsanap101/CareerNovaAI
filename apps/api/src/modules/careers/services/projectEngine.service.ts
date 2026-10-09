// @ts-nocheck
import { StudentProfileData, CareerRequiredSkill } from './roadmapEngine.service';

export type ProjectDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PORTFOLIO';

export interface ProjectData {
  project_id: string;
  title: string;
  description: string;
  difficulty: ProjectDifficulty;
  estimated_hours: number;
  skills_covered: string[];
  technologies: string[];
  prerequisites: string[];
  expected_output: string;
  portfolio_value: string;
  resume_bullet_hint: string;
}

export class ProjectEngineService {
  private catalog: ProjectData[];

  constructor(catalog: ProjectData[]) {
    this.catalog = catalog;
  }

  /**
   * Recommends 4 highly personalized projects for the student's roadmap.
   * 1. Foundation Project
   * 2. Skill-Gap Project
   * 3. Portfolio Project
   * 4. Placement-Level Capstone
   */
  public recommendProjects(
    student: StudentProfileData,
    skillGaps: string[], // array of skillIds that the student lacks
    currentStrengths: string[], // array of skillIds the student already knows
    requiredSkills: CareerRequiredSkill[]
  ): {
    foundation: ProjectData | null;
    skillGap: ProjectData | null;
    portfolio: ProjectData | null;
    capstone: ProjectData | null;
  } {
    const studentYear = student.year || 1;
    
    // Analyze existing student projects to determine over-represented skills
    const existingProjectSkills = new Map<string, number>();
    (student.projects || []).forEach(p => {
      if (p.skills_covered && Array.isArray(p.skills_covered)) {
        p.skills_covered.forEach((skillId: string) => {
          existingProjectSkills.set(skillId, (existingProjectSkills.get(skillId) || 0) + 1);
        });
      }
    });

    // Helper: score a project's relevance
    const scoreProject = (
      project: ProjectData, 
      targetDifficulty: ProjectDifficulty[], 
      preferGaps: boolean,
      requireCapstone: boolean = false
    ): number => {
      let score = 0;

      // 1. Difficulty match (heavily weighted)
      if (targetDifficulty.includes(project.difficulty)) {
        score += 50;
      } else {
        score -= 20; // Penalize wrong difficulty
      }

      // 2. Capstone check
      if (requireCapstone && project.difficulty !== 'PORTFOLIO') {
        return -999; // Must be a portfolio/capstone level
      }

      // 3. Relevance to Career Requirements
      const careerReqIds = requiredSkills.map(r => r.skillId);
      const relevantSkills = project.skills_covered.filter(s => careerReqIds.includes(s));
      score += relevantSkills.length * 10;

      // 4. Personalization: Strengths vs Gaps
      project.skills_covered.forEach(skillId => {
        if (skillGaps.includes(skillId)) {
          score += preferGaps ? 15 : 5;
        } else if (currentStrengths.includes(skillId)) {
          score += preferGaps ? 0 : 15;
        }
        
        // 5. Avoid redundant domains (If student already has 3 ML projects, penalize ML)
        const timesPracticed = existingProjectSkills.get(skillId) || 0;
        if (timesPracticed > 0) {
          score -= (timesPracticed * 10);
        }
      });

      return score;
    };

    const getBestProject = (
      pool: ProjectData[], 
      targetDifficulty: ProjectDifficulty[], 
      preferGaps: boolean, 
      requireCapstone: boolean = false
    ): ProjectData | null => {
      if (pool.length === 0) return null;
      const scored = pool.map(p => ({ project: p, score: scoreProject(p, targetDifficulty, preferGaps, requireCapstone) }));
      scored.sort((a, b) => b.score - a.score);
      return scored[0].score > -100 ? scored[0].project : null;
    };

    let availablePool = [...this.catalog];

    // 1. Foundation Project
    // Focus: Solidify what they know or early concepts. Year 1/2 gets Beginner. Year 3/4 gets Intermediate.
    const foundationDiff: ProjectDifficulty[] = studentYear <= 2 ? ['BEGINNER'] : ['INTERMEDIATE', 'BEGINNER'];
    const foundation = getBestProject(availablePool, foundationDiff, false);
    if (foundation) availablePool = availablePool.filter(p => p.project_id !== foundation.project_id);

    // 2. Skill-Gap Project
    // Focus: Targeting their direct weaknesses.
    const gapDiff: ProjectDifficulty[] = studentYear <= 2 ? ['INTERMEDIATE'] : ['ADVANCED', 'INTERMEDIATE'];
    const skillGap = getBestProject(availablePool, gapDiff, true);
    if (skillGap) availablePool = availablePool.filter(p => p.project_id !== skillGap.project_id);

    // 3. Portfolio Project
    // Focus: Complex, multi-skill integration.
    const portDiff: ProjectDifficulty[] = ['ADVANCED', 'PORTFOLIO'];
    const portfolio = getBestProject(availablePool, portDiff, true);
    if (portfolio) availablePool = availablePool.filter(p => p.project_id !== portfolio.project_id);

    // 4. Placement-Level Capstone
    // Focus: Extreme integration, production deployment.
    const capstoneDiff: ProjectDifficulty[] = ['PORTFOLIO'];
    const capstone = getBestProject(availablePool, capstoneDiff, true, true) || getBestProject(availablePool, ['ADVANCED'], true, false);

    return {
      foundation,
      skillGap,
      portfolio,
      capstone
    };
  }
}
