import { PlannedSkill } from '../../baselines/B3_CONSTRAINED_PLANNER/planner';

export interface RoadmapChurnMetrics {
    retainedSkills: string[];
    addedSkills: string[];
    removedSkills: string[];
    reorderedSkills: string[];
    budgetDelta: number;
    careerTargetChanged: boolean;
}

/**
 * Formula: RoadmapChurn(R_t, R_t+1)
 * Calculates native delta matrices measuring the exact pipeline displacement triggered by B4 Replanning 
 */
export function calculateRoadmapChurn(oldPlan: PlannedSkill[], newPlan: PlannedSkill[], oldCareer: string, newCareer: string): RoadmapChurnMetrics {
    const oldIds = oldPlan.map(p => p.skillId);
    const newIds = newPlan.map(p => p.skillId);

    const retainedSkills = newIds.filter(id => oldIds.includes(id));
    const addedSkills = newIds.filter(id => !oldIds.includes(id));
    const removedSkills = oldIds.filter(id => !newIds.includes(id));

    const reorderedSkills = retainedSkills.filter(id => {
        const oldIndex = oldPlan.findIndex(p => p.skillId === id);
        const newIndex = newPlan.findIndex(p => p.skillId === id);
        if (oldIndex === -1 || newIndex === -1) return false;
        return oldPlan[oldIndex].phase !== newPlan[newIndex].phase;
    });

    let oldBudget = 0;
    for (const p of oldPlan) oldBudget += p.learningCost || 0;

    let newBudget = 0;
    for (const p of newPlan) newBudget += p.learningCost || 0;

    return {
        retainedSkills,
        addedSkills,
        removedSkills,
        reorderedSkills,
        budgetDelta: newBudget - oldBudget,
        careerTargetChanged: oldCareer !== newCareer
    };
}
