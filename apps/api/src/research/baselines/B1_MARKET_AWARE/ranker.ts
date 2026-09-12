export interface ConfigWeights {
    alpha: number;
    beta: number;
    gamma: number;
    delta: number;
}

export const DEFAULT_WEIGHTS: ConfigWeights = {
    alpha: 0.40,
    beta: 0.20,
    gamma: 0.10,
    delta: 0.30
};

export interface B1StudentState {
    roleGoal?: string;
    industryGoal?: string;
    interests: string[];
    proficiencies: Record<string, number>; // skillId -> proficiency (0-1)
}

export interface B1CareerState {
    id: string;
    role: string;
    industry: string;
    tags: string[];
    requiredSkills: Array<{ skillId: string, weight: number }>; // Weight 0-1
}

// Emulates fetching demand from the Job Demand Engine
export type DemandFetcher = (skillId: string, careerId: string) => number;

export interface RankerExplanation {
    possessedSkills: string[];
    importantMissing: string[];
    highDemandMissing: string[];
    goalAlignment: string[];
    text: string;
}

export interface B1RankerResult {
    career_id: string;
    score: number;
    skill_fit: number;
    goal_fit: number;
    interest_fit: number;
    market_alignment: number;
    explanation: RankerExplanation;
}

export class MarketAwareRanker {
    private weights: ConfigWeights;

    constructor(weights: ConfigWeights = DEFAULT_WEIGHTS) {
        // Re-normalize to ensure sum is 1.0
        const sum = weights.alpha + weights.beta + weights.gamma + weights.delta;
        this.weights = {
            alpha: weights.alpha / sum,
            beta: weights.beta / sum,
            gamma: weights.gamma / sum,
            delta: weights.delta / sum
        };
    }

    public rankCareer(
        student: B1StudentState,
        career: B1CareerState,
        demandModel: DemandFetcher
    ): B1RankerResult {
        // 1. SkillFit
        let earnedSkill = 0;
        let totalSkillWeight = 0;
        const possessed: string[] = [];
        const missing: { id: string, w: number, demand: number }[] = [];

        career.requiredSkills.forEach(req => {
            totalSkillWeight += req.weight;
            const prof = student.proficiencies[req.skillId] || 0;
            earnedSkill += (req.weight * Math.min(1.0, prof));

            const demand = demandModel(req.skillId, career.id);

            if (prof >= 0.5) { // Assuming 0.5 is proficient baseline
                possessed.push(req.skillId);
            } else {
                missing.push({ id: req.skillId, w: req.weight, demand });
            }
        });

        const skill_fit = totalSkillWeight > 0 ? (earnedSkill / totalSkillWeight) : 0;

        // 2. GoalFit
        let goal_fit = 0;
        const goalHits: string[] = [];
        if (student.roleGoal === career.role) { goal_fit += 1.0; goalHits.push('Role Match'); }
        else if (student.industryGoal === career.industry) { goal_fit += 0.5; goalHits.push('Industry Match'); }
        goal_fit = Math.min(1.0, goal_fit);

        // 3. InterestFit
        const overlap = career.tags.filter(t => student.interests.includes(t)).length;
        const interest_fit = career.tags.length > 0 ? Math.min(1.0, overlap / career.tags.length) : 0.0;

        // 4. MarketAlignment
        // Average demand of MISSING skills for the target career. 
        // This pushes the user towards careers where the skills they need to learn are highly demanded.
        let marketSum = 0;
        missing.forEach(m => marketSum += m.demand);
        const market_alignment = missing.length > 0 ? Math.min(1.0, marketSum / missing.length) : 1.0;

        // Numerical Score
        const score = (
            this.weights.alpha * skill_fit +
            this.weights.beta * goal_fit +
            this.weights.gamma * interest_fit +
            this.weights.delta * market_alignment
        );

        // Explanation Generation (Deterministic)
        missing.sort((a, b) => b.w - a.w);
        const importantMissing = missing.slice(0, 3).map(m => m.id);

        missing.sort((a, b) => b.demand - a.demand);
        const highDemandMissing = missing.filter(m => m.demand >= 0.7).map(m => m.id);

        const explanationText = `This career ranked highly because you have ${possessed.length} foundational skills. ` +
            `Your targets align with ${goalHits.join(' and ')}. ` +
            (highDemandMissing.length > 0 ? `The missing skills (${highDemandMissing.slice(0, 2).join(', ')}) possess extremely high market demand.` : `You are close to market readiness.`);

        return {
            career_id: career.id,
            score,
            skill_fit,
            goal_fit,
            interest_fit,
            market_alignment,
            explanation: {
                possessedSkills: possessed,
                importantMissing,
                highDemandMissing,
                goalAlignment: goalHits,
                text: explanationText
            }
        };
    }
}
