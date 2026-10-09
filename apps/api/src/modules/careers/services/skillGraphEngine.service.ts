export enum DependencyType {
  FOUNDATIONAL = 'FOUNDATIONAL',
  REQUIRED = 'REQUIRED',
  RECOMMENDED = 'RECOMMENDED',
  OPTIONAL = 'OPTIONAL'
}

export enum SkillReadinessStatus {
  ALREADY_MASTERED = 'Already Mastered',
  PARTIALLY_READY = 'Partially Ready',
  READY_TO_LEARN = 'Ready to Learn',
  BLOCKED_BY_PREREQUISITE = 'Blocked by Prerequisite',
  OPTIONAL = 'Optional',
}

export interface SkillDependency {
  skillId: string;
  prerequisiteSkillId: string;
  dependencyType: DependencyType;
  dependencyStrength: number; // 1 to 5 scale (minimum proficiency required)
}

export interface UserSkillProficiency {
  skillId: string;
  currentProficiency: number; // 0 to 5 scale
}

export interface RoadmapSkillRequirement {
  skillId: string;
  targetProficiency: number; // 1 to 5 scale
  isOptional: boolean;
}

/**
 * PATHFORGE Skill Prerequisite Graph Engine
 * Determines the logical learning order and student-aware readiness for skills.
 */
export class SkillGraphEngine {
  private dependencies: SkillDependency[];

  constructor(dependencies: SkillDependency[]) {
    this.dependencies = dependencies;
  }

  /**
   * Determine the readiness status of a specific skill in a roadmap for a student.
   * 
   * Rule: A skill should only become "Ready to Learn" when its required 
   * prerequisites are satisfied.
   */
  public evaluateSkillReadiness(
    roadmapSkill: RoadmapSkillRequirement,
    userProficiencies: Map<string, UserSkillProficiency>
  ): SkillReadinessStatus {
    const userProficiency = userProficiencies.get(roadmapSkill.skillId)?.currentProficiency || 0;

    // 1. Check if Already Mastered
    if (userProficiency >= roadmapSkill.targetProficiency) {
      return SkillReadinessStatus.ALREADY_MASTERED;
    }

    // 2. Check if Partially Ready (User has started learning it, but hasn't reached target)
    if (userProficiency > 0 && userProficiency < roadmapSkill.targetProficiency) {
      return SkillReadinessStatus.PARTIALLY_READY;
    }

    // 3. Evaluate prerequisites
    const skillDeps = this.dependencies.filter(d => d.skillId === roadmapSkill.skillId);
    
    // Strictly block on REQUIRED and FOUNDATIONAL dependencies
    const blockingDeps = skillDeps.filter(d => 
      d.dependencyType === DependencyType.REQUIRED || 
      d.dependencyType === DependencyType.FOUNDATIONAL
    );

    let isBlocked = false;
    for (const dep of blockingDeps) {
      const depProficiency = userProficiencies.get(dep.prerequisiteSkillId)?.currentProficiency || 0;
      
      // The user must meet or exceed the required dependency strength (proficiency level)
      // Example: ML requires Python at level 4. If user Python is 3, they are blocked.
      if (depProficiency < dep.dependencyStrength) {
        isBlocked = true;
        break;
      }
    }

    if (isBlocked) {
      return SkillReadinessStatus.BLOCKED_BY_PREREQUISITE;
    }

    // 4. If not blocked, check if the skill is purely Optional in this specific roadmap
    if (roadmapSkill.isOptional) {
      return SkillReadinessStatus.OPTIONAL;
    }

    // 5. Otherwise, the skill is Ready to Learn (All dependencies met)
    return SkillReadinessStatus.READY_TO_LEARN;
  }

  /**
   * Evaluate an array of roadmap skills to determine what the student should focus on next.
   */
  public evaluateRoadmap(
    roadmapSkills: RoadmapSkillRequirement[],
    userProficiencies: Map<string, UserSkillProficiency>
  ): Map<string, SkillReadinessStatus> {
    const readinessMap = new Map<string, SkillReadinessStatus>();

    for (const rs of roadmapSkills) {
      readinessMap.set(
        rs.skillId, 
        this.evaluateSkillReadiness(rs, userProficiencies)
      );
    }

    return readinessMap;
  }
}
