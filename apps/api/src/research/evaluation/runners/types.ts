export type CareerBaselineModel = 'B0_BYSER' | 'B1_SEMANTIC' | 'B2_MARKET_AWARE' | 'PROPOSED_MARKET_GAP_CONSTRAINED';
export type RoadmapBaselineModel = 'R0_LEGACY' | 'R1_GAP_ONLY' | 'R2_MARKET_ONLY' | 'R3_GAP_IMPORTANCE_MARKET' | 'R4_R3_PLUS_PREREQUISITES' | 'R5_FULL_CLOSED_LOOP';

export interface ExperimentConfiguration {
    experimentId: string;
    datasetPath: string; // E.g., 'synthetic/test_batch_01.json'
    careerModel: CareerBaselineModel;
    roadmapModel: RoadmapBaselineModel;
    randomSeed: number;
    parameters: {
        budgetHours?: number;
        alphaSkill?: number;
        betaGoal?: number;
        gammaInterest?: number;
        deltaMarket?: number;
    };
    evaluationProtocol: 'SINGLE_SHOT' | 'LONGITUDINAL_PERTURBATION';
}

export interface CareerEvaluationOutput {
    career_id: string;
    score: number;
    rank: number;
    market_alignment?: number;
    skill_fit?: number;
}

export interface RoadmapEvaluationOutput {
    phase: number;
    skillId: string;
    priority: number;
    gap?: number;
    marketDemand?: number;
    learningCost: number;
    prerequisites: string[];
    reason: string;
}

export interface ExperimentResultPayload {
    experimentId: string;
    timestamp: string;
    careerResults: CareerEvaluationOutput[];
    roadmapResults: RoadmapEvaluationOutput[];
    metaTracking: {
        prerequisiteViolations: number;
        deferredTargets: number;
        roadmapChurn?: number;
    };
}
