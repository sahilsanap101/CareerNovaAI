import { PersonalizedRoadmap, RoadmapNode } from './roadmapEngine.service';
import { SkillGraphEngine } from './skillGraphEngine.service';

export type NodeStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export interface RoadmapNodeProgress {
  skillId: string;
  status: NodeStatus;
  completion_percentage: number;
  started_at: Date | null;
  completed_at: Date | null;
  notes: string;
}

export interface RoadmapDashboardStats {
  overallProgressPercentage: number;
  stageProgress: Record<number, number>; // stageNumber -> percentage
  skillsCompleted: number;
  skillsRemaining: number;
  projectsCompleted: number;
  resourcesCompleted: number;
  placementReadinessPercentage: number;
}

export class RoadmapProgressService {
  /**
   * Evaluates a roadmap against the student's progress and the skill graph.
   * Unlocks nodes whose prerequisites are met.
   * Calculates dashboard statistics.
   */
  public evaluateProgress(
    roadmap: PersonalizedRoadmap,
    studentProgress: Record<string, RoadmapNodeProgress>
  ): { 
    updatedRoadmap: PersonalizedRoadmap; 
    dashboardStats: RoadmapDashboardStats 
  } {
    
    let totalNodes = 0;
    let completedNodes = 0;
    
    let totalProjects = roadmap.recommendedProjects ? 4 : 0; // Foundation, Gap, Port, Capstone
    let projectsCompleted = 0; // In a real app, projects would have their own tracking IDs.
    
    let resourcesCompleted = 0; // Placeholder for resource tracking logic
    
    let placementTotal = 0;
    let placementCompleted = 0;

    const stageProgress: Record<number, number> = {};

    // Clone roadmap for mutations
    const updatedRoadmap: PersonalizedRoadmap = JSON.parse(JSON.stringify(roadmap));

    // 1. First Pass: Map completed skills for unlocking evaluation
    const completedSkillIds = new Set<string>();
    updatedRoadmap.currentStrengths.forEach(s => completedSkillIds.add(s)); // implicitly completed
    
    for (const [skillId, progress] of Object.entries(studentProgress)) {
      if (progress.status === 'COMPLETED') {
        completedSkillIds.add(skillId);
      }
    }

    // 2. Second Pass: Evaluate and update each node
    for (const stage of updatedRoadmap.roadmapStages) {
      let stageNodesTotal = 0;
      let stageNodesCompleted = 0;

      for (const node of stage.nodes) {
        totalNodes++;
        stageNodesTotal++;

        // Is it a placement node?
        if (node.skillId.startsWith('PL_')) {
          placementTotal++;
        }

        // Get student's tracked state, or default
        const tracking = studentProgress[node.skillId];
        let currentStatus: NodeStatus = 'BLOCKED'; // default restrictive
        
        if (tracking) {
           currentStatus = tracking.status;
           if (currentStatus === 'COMPLETED') {
             completedNodes++;
             stageNodesCompleted++;
             if (node.skillId.startsWith('PL_')) placementCompleted++;
             resourcesCompleted += 3; // Mocking resources completed for this node
           }
        } 

        // 3. Unlocking Logic
        // If it's not completed or in progress, we check if it should be UNLOCKED (NOT_STARTED) or stay BLOCKED
        if (currentStatus === 'BLOCKED' || (!tracking)) {
          let canUnlock = true;
          
          if (node.prerequisites && node.prerequisites.length > 0) {
            for (const p of node.prerequisites) {
              const prereq: any = p;
              if (!completedSkillIds.has(prereq.name || prereq) && !completedSkillIds.has(prereq.skillId || prereq.name || prereq)) {
                canUnlock = false;
                break;
              }
            }
          }

          currentStatus = canUnlock ? 'NOT_STARTED' : 'BLOCKED';
        }

        // Inject tracking state into node
        (node as any).trackingStatus = currentStatus;
        (node as any).completionPercentage = tracking?.completion_percentage || 0;
        
        // Update prereq visual state
        if (node.prerequisites) {
          for (let i=0; i<node.prerequisites.length; i++) {
             const prereq: any = node.prerequisites[i];
             const met = completedSkillIds.has(prereq.name || prereq) || completedSkillIds.has(prereq.skillId || prereq.name || prereq);
             if (typeof prereq === 'object') prereq.met = met;
          }
        }
      }

      // Calculate stage progress
      stageProgress[stage.stageNumber] = stageNodesTotal > 0 
        ? Math.round((stageNodesCompleted / stageNodesTotal) * 100) 
        : 100;
    }

    const overallProgressPercentage = totalNodes > 0 
      ? Math.round((completedNodes / totalNodes) * 100) 
      : 0;

    const placementReadinessPercentage = placementTotal > 0 
      ? Math.round((placementCompleted / placementTotal) * 100) 
      : 0;

    const dashboardStats: RoadmapDashboardStats = {
      overallProgressPercentage,
      stageProgress,
      skillsCompleted: completedNodes,
      skillsRemaining: totalNodes - completedNodes,
      projectsCompleted,
      resourcesCompleted,
      placementReadinessPercentage
    };

    return { updatedRoadmap, dashboardStats };
  }
}
