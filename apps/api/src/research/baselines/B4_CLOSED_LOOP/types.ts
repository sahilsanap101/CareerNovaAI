/**
 * Interfaces backing the Closed-Loop Adaptation controller.
 */

export interface SkillAssessmentEvidence {
    skillId: string;
    source: 'ASSESSMENT_TEST' | 'MANUAL_OVERRIDE' | 'EXTERNAL_CERTIFICATION';
    measuredProficiency: number;
    confidence: number;
    timestamp: string;
}

export interface StudentStateSnapshot {
    versionId: string;
    timestamp: string;
    proficiencies: Record<string, number>;
    latestEvidence?: SkillAssessmentEvidence;
}

export interface MarketDemandSnapshot {
    versionId: string;
    timestamp: string;
    demandScores: Record<string, number>;
    triggerContext?: string;
}

export interface RoadmapVersion {
    versionId: string;
    timestamp: string;
    studentStateId: string;
    marketStateId: string;
    scheduledSkillIds: string[];
}

export interface RoadmapChange {
    previousVersionId: string;
    newVersionId: string;
    addedSkills: string[];
    removedSkills: string[];
    retainedSkills: string[];
    causeVector: 'STUDENT_STATE_CHANGE' | 'MARKET_STATE_CHANGE' | 'BOTH';
    churnMetric: number;
    explanation: string;
}
