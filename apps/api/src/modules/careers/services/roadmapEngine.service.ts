// @ts-nocheck
import { SkillGraphEngine, DependencyType } from './skillGraphEngine.service';
import { ProjectEngineService, ProjectData } from './projectEngine.service';

export enum SkillStatus {
  MASTERED = 'MASTERED',
  STRONG = 'STRONG',
  PARTIAL = 'PARTIAL',
  GAP = 'GAP',
  BLOCKED = 'BLOCKED',
  OPTIONAL = 'OPTIONAL'
}

export interface StudentProfileData {
  year?: number;
  semester?: number;
  proficiencies: Record<string, number>; // skillId -> proficiency (0 to 5)
  projects: any[];
  certifications: any[];
}

export interface CareerRequiredSkill {
  skillId: string;
  skillName: string;
  importanceWeight: number;
  minimumProficiency: number;
  recommendedProficiency: number;
  skillType: string; // CORE, IMPORTANT, OPTIONAL
}

export interface CareerPathData {
  id: string;
  name: string;
  domain?: string;
  requiredSkills: CareerRequiredSkill[];
}

export interface ResourceData {
  resource_id: string;
  title: string;
  resource_type: string;
  provider: string;
  skill_id: string;
  url: string;
  level?: string;
  estimated_hours: number;
}

export interface RecommendedResources {
  learn: ResourceData | { fallback: string };
  documentation: ResourceData | { fallback: string };
  watch: ResourceData | { fallback: string };
  practice: ResourceData | { fallback: string };
  build: ResourceData | ProjectData | { fallback: string };
}

export interface RoadmapNode {
  skillId: string;
  skillName: string;
  status: SkillStatus;
  stage: number;
  order: number;
  whyNeeded: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  prerequisites: string[];
  resources: RecommendedResources;
}

export interface RoadmapStage {
  stageNumber: number;
  title: string;
  focus: string;
  nodes: RoadmapNode[];
}

export interface PersonalizedRoadmap {
  career: string;
  startingLevel: string;
  currentStrengths: string[];
  skillGaps: string[];
  roadmapStages: RoadmapStage[];
  recommendedProjects: {
    foundation: ProjectData | null;
    skillGap: ProjectData | null;
    portfolio: ProjectData | null;
    capstone: ProjectData | null;
  };
  estimatedTotalHours: number;
  estimatedCompletionRange: string;
  nextRecommendedAction: string;
}

export class RoadmapEngineService {
  private skillGraph: SkillGraphEngine;
  private resources: ResourceData[];
  private projects: ProjectData[];
  private projectEngine: ProjectEngineService;

  constructor(skillGraph: SkillGraphEngine, resources: ResourceData[], projects: ProjectData[]) {
    this.skillGraph = skillGraph;
    this.resources = resources;
    this.projects = projects;
    this.projectEngine = new ProjectEngineService(projects);
  }

  private selectResources(skillId: string, currentLevel: number): { resources: RecommendedResources, hours: number } {
    let targetLevel = 'BEGINNER';
    if (currentLevel >= 3) {
      targetLevel = 'ADVANCED';
    } else if (currentLevel > 0) {
      targetLevel = 'INTERMEDIATE';
    }

    const availableResources = this.resources.filter(r => r.skill_id === skillId);
    
    // Fallback order: Exact level match -> ALL -> first available
    const getBestResource = (types: string[]): ResourceData | null => {
      const ofType = availableResources.filter(r => types.includes(r.resource_type));
      if (ofType.length === 0) return null;

      const exactMatch = ofType.find(r => r.level === targetLevel);
      if (exactMatch) return exactMatch;

      const allMatch = ofType.find(r => r.level === 'ALL');
      if (allMatch) return allMatch;

      return ofType[0]; // Just return the first available if no specific level match
    };

    const learn = getBestResource(['COURSE', 'TUTORIAL', 'BOOK']) || null;
    const documentation = getBestResource(['OFFICIAL_DOCUMENTATION']) || null;
    const watch = getBestResource(['VIDEO', 'PLAYLIST', 'YOUTUBE_PLAYLIST']) || null;
    const practice = getBestResource(['PRACTICE', 'CODING_PRACTICE']) || null;
    
    let build: ResourceData | ProjectData | null = getBestResource(['PROJECT']) || null;
    if (!build) {
      // Fallback to global projects if no specific project resource is attached
      const availProjects = this.projects.filter(p => p.skills_covered.includes(skillId));
      if (availProjects.length > 0) {
        build = availProjects[0];
      }
    }

    const fallback = { fallback: 'Resource not verified yet' };
    let hours = 0;
    
    if (learn && 'estimated_hours' in learn) hours += (learn.estimated_hours || 0);
    if (documentation && 'estimated_hours' in documentation) hours += (documentation.estimated_hours || 0);
    if (watch && 'estimated_hours' in watch) hours += (watch.estimated_hours || 0);
    if (practice && 'estimated_hours' in practice) hours += (practice.estimated_hours || 0);
    if (build && 'estimated_hours' in build) hours += (build.estimated_hours || 0);

    return {
      resources: {
        learn: learn || fallback,
        documentation: documentation || fallback,
        watch: watch || fallback,
        practice: practice || fallback,
        build: build || fallback
      },
      hours
    };
  }

  public generatePersonalizedRoadmap(
    student: StudentProfileData,
    career: CareerPathData
  ): PersonalizedRoadmap {
    const nodes: RoadmapNode[] = [];
    const currentStrengths: string[] = [];
    const skillGaps: string[] = [];
    const strengthIds: string[] = [];
    const skillGapIds: string[] = [];
    let totalHours = 0;

    // 1. Load career required skills & calculate gaps
    const skillMap = new Map<string, CareerRequiredSkill>();
    career.requiredSkills.forEach(s => skillMap.set(s.skillId, s));

    const remainingSkillsToStage = new Set<string>();

    for (const reqSkill of career.requiredSkills) {
      const currentLevel = student.proficiencies[reqSkill.skillId] || 0;
      const targetLevel = reqSkill.recommendedProficiency;
      const gap = Math.max(0, targetLevel - currentLevel);

      let status = SkillStatus.GAP;

      // Status calculation
      if (currentLevel >= reqSkill.recommendedProficiency) {
        status = SkillStatus.MASTERED;
        currentStrengths.push(reqSkill.skillName);
        strengthIds.push(reqSkill.skillId);
      } else if (currentLevel >= reqSkill.minimumProficiency) {
        status = SkillStatus.STRONG;
        currentStrengths.push(reqSkill.skillName);
        strengthIds.push(reqSkill.skillId);
      } else if (currentLevel > 0) {
        status = SkillStatus.PARTIAL;
        skillGaps.push(reqSkill.skillName);
        skillGapIds.push(reqSkill.skillId);
      } else if (reqSkill.skillType === 'OPTIONAL') {
        status = SkillStatus.OPTIONAL;
      } else {
        skillGaps.push(reqSkill.skillName);
        skillGapIds.push(reqSkill.skillId);
      }

      const recommended = this.selectResources(reqSkill.skillId, currentLevel);

      const node: RoadmapNode = {
        skillId: reqSkill.skillId,
        skillName: reqSkill.skillName,
        status,
        stage: 0,
        order: 0,
        whyNeeded: `Required for ${career.name} (Type: ${reqSkill.skillType})`,
        currentLevel,
        requiredLevel: targetLevel,
        gap,
        prerequisites: [],
        resources: recommended.resources
      };

      if (status === SkillStatus.MASTERED || status === SkillStatus.STRONG) {
        node.stage = -1; // Completed, doesn't need staging
      } else {
        remainingSkillsToStage.add(reqSkill.skillId);
        totalHours += recommended.hours;
      }

      nodes.push(node);
    }

    // 2. Resolve Prerequisites & Calculate Staging (Topological layering)
    let currentStage = 1;
    let changed = true;
    
    while (remainingSkillsToStage.size > 0 && changed) {
      changed = false;
      const layerSkills = new Set<string>();

      for (const skillId of remainingSkillsToStage) {
        const node = nodes.find(n => n.skillId === skillId);
        if (!node) continue;

        const deps = (this.skillGraph as any).dependencies.filter((d: any) => d.skillId === skillId);
        node.prerequisites = deps.map((d: any) => d.prerequisiteSkillId);

        let isBlocked = false;
        for (const dep of deps) {
          if (dep.dependencyType === DependencyType.REQUIRED || dep.dependencyType === DependencyType.FOUNDATIONAL) {
            if (remainingSkillsToStage.has(dep.prerequisiteSkillId)) {
              isBlocked = true;
              break;
            }
          }
        }

        if (isBlocked) {
          node.status = SkillStatus.BLOCKED;
        } else {
          if (node.status === SkillStatus.BLOCKED) {
            node.status = SkillStatus.GAP; 
          }
          layerSkills.add(skillId);
        }
      }

      let orderCount = 1;
      for (const skillId of layerSkills) {
        const node = nodes.find(n => n.skillId === skillId);
        if (node) {
          node.stage = currentStage;
          node.order = orderCount++;
          remainingSkillsToStage.delete(skillId);
          changed = true;
        }
      }

      if (changed) {
        currentStage++;
      } else if (remainingSkillsToStage.size > 0) {
        for (const skillId of remainingSkillsToStage) {
          const node = nodes.find(n => n.skillId === skillId);
          if (node) {
            node.stage = currentStage;
            node.status = SkillStatus.BLOCKED; 
          }
        }
        remainingSkillsToStage.clear();
        currentStage++;
      }
    }

    // 3. Assemble Stages
    const stagesMap = new Map<number, RoadmapNode[]>();
    nodes.filter(n => n.stage > 0).forEach(n => {
      if (!stagesMap.has(n.stage)) stagesMap.set(n.stage, []);
      stagesMap.get(n.stage)!.push(n);
    });

    const roadmapStages: RoadmapStage[] = [];
    const sortedStageNums = Array.from(stagesMap.keys()).sort((a, b) => a - b);

    for (let i = 0; i < sortedStageNums.length; i++) {
      const sNum = sortedStageNums[i];
      let title = `Stage ${i + 1}: Core Skills`;
      let focus = "Learning missing prerequisites and core skills.";

      const studentYear = student.year || 1;
      if (i === 0) {
        title = "Stage 1: Foundation";
        focus = studentYear === 1 ? "Exploration and basic foundations." : "Fast-track foundations.";
      } else if (i === sortedStageNums.length - 1) {
        title = `Stage ${i + 1}: Advanced Specialization`;
        focus = "Mastering advanced career-specific skills.";
      }

      roadmapStages.push({
        stageNumber: i + 1,
        title,
        focus,
        nodes: stagesMap.get(sNum)!.sort((a, b) => (a.order || 0) - (b.order || 0))
      });
    }

    // 4. Add Interview & Placement Preparation (Role-Specific)
    const finalStageNum = roadmapStages.length + 1;
    const placementNodes: RoadmapNode[] = [];
    let placementOrder = 1;

    const addPlacementNode = (skillId: string, skillName: string, whyNeeded: string) => {
      placementNodes.push({
        skillId,
        skillName,
        status: SkillStatus.GAP,
        stage: finalStageNum,
        order: placementOrder++,
        whyNeeded,
        currentLevel: 0,
        requiredLevel: 5,
        gap: 5,
        prerequisites: [],
        resources: {
          learn: { fallback: 'Interview prep material not linked yet' },
          documentation: { fallback: 'Interview prep material not linked yet' },
          watch: { fallback: 'Interview prep material not linked yet' },
          practice: { fallback: 'Interview prep material not linked yet' },
          build: { fallback: 'Interview prep material not linked yet' }
        }
      });
    };

    const cName = career.name.toLowerCase();
    const isSoftwareRole = cName.includes('engineer') || cName.includes('developer') || cName.includes('software');
    const isDataRole = cName.includes('data') || cName.includes('analyst') || cName.includes('scientist');
    const isAIRole = cName.includes('ai') || cName.includes('machine learning') || cName.includes('ml');
    const isFrontendRole = cName.includes('frontend') || cName.includes('ui');

    // General Prep (Always included)
    addPlacementNode('PL_resume', 'Resume & GitHub Profile', 'Essential for passing ATS filters and recruiter shortlisting.');
    
    // Domain Specific Prep
    if (isSoftwareRole) {
      addPlacementNode('PL_dsa', 'Data Structures & Algorithms', 'Core requirement for technical coding rounds.');
      addPlacementNode('PL_cs_core', 'CS Fundamentals (OOP, OS, DBMS)', 'Frequently tested in core engineering interviews.');
    }
    
    if (isFrontendRole) {
      addPlacementNode('PL_js_react_concepts', 'Advanced JS & React Concepts', 'Core for frontend engineering technical rounds.');
      addPlacementNode('PL_browser_ui', 'Browser & UI Architecture', 'Testing DOM manipulation and web performance concepts.');
    }

    if (isDataRole) {
      addPlacementNode('PL_sql_prep', 'Advanced SQL & Query Optimization', 'The most tested skill in data interviews.');
      addPlacementNode('PL_stats_excel', 'Statistics & Visualization', 'Required for data interpretation rounds.');
      addPlacementNode('PL_case_studies', 'Business Case Studies', 'Evaluate problem-solving for analytics roles.');
    }

    if (isAIRole) {
      addPlacementNode('PL_ml_system', 'ML System Design', 'Architecting end-to-end ML pipelines and deployment.');
      addPlacementNode('PL_ai_concepts', 'AI/ML Theoretical Concepts', 'Deep dive into math, loss functions, and model theory.');
    }

    if (isSoftwareRole && !isFrontendRole) {
      addPlacementNode('PL_system_design', 'System Design (HLD & LLD)', 'Crucial for scalable software and backend engineering roles.');
    }

    addPlacementNode('PL_behavioral', 'Behavioral Interview (HR)', 'Preparation for culture fit and behavioral questions.');
    addPlacementNode('PL_mock_interview', 'Mock Technical Interviews', 'Simulate real interview pressure before the actual day.');

    roadmapStages.push({
      stageNumber: finalStageNum,
      title: `Stage ${finalStageNum}: Placement Preparation`,
      focus: "Role-specific interview preparation and job readiness.",
      nodes: placementNodes
    });
    totalHours += placementNodes.length * 10; // ~10 hours buffer per prep topic

    // 5. Determine Starting Level
    let startingLevel = 'Beginner';
    if (currentStrengths.length > skillGaps.length * 2) {
      startingLevel = 'Advanced';
    } else if (currentStrengths.length >= skillGaps.length * 0.5) {
      startingLevel = 'Intermediate';
    }

    // 6. Generate Project Recommendations
    const recommendedProjects = this.projectEngine.recommendProjects(
      student,
      skillGapIds,
      strengthIds,
      career.requiredSkills
    );

    // 7. Return Final Object
    return {
      career: career.name,
      startingLevel,
      currentStrengths,
      skillGaps,
      roadmapStages,
      recommendedProjects,
      estimatedTotalHours: totalHours,
      estimatedCompletionRange: totalHours > 200 ? '4-6 Months' : '2-3 Months',
      nextRecommendedAction: roadmapStages[0]?.nodes[0] 
        ? `Start learning: ${roadmapStages[0].nodes[0].skillName}`
        : 'Begin Interview Preparation'
    };
  }
}
