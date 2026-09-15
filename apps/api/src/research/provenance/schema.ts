export type EvidenceType = 'resume' | 'assessment' | 'project' | 'course' | 'github' | 'manual';

export type ProvenanceStage =
    | 'RAW_SOURCE'
    | 'PROCESSED_ARTIFACT'
    | 'CANONICAL_ENTITY'
    | 'MODEL_FEATURE'
    | 'EXPERIMENT'
    | 'RESULT'
    | 'PAPER_TABLE';

export interface ProvenanceNode {
    entityId: string;
    parentEntityIds: string[];
    transformationMethod: string;
    stage: ProvenanceStage;
    timestamp: string;
    metadata: Record<string, any>;
}

export interface SkillEvidence {
    skillId: string;
    evidenceType: EvidenceType;
    evidenceSource: string;
    evidenceValue: number;       // Nominal evaluation (0.0 -> 1.0)
    confidence: number;          // Calibration weight (0.0 -> 1.0)
    provenance: ProvenanceNode;
    extractionMethod: string;
    timestamp: string;
}

/** 
 * Defines exactly how uncertain assertions cascade analytically 
 * down to the Priority planner constraint engine strictly. 
 */
export function applyUncertaintyPenalty(priority: number, confidence: number, strategy: 'linear' | 'conservative'): number {
    if (strategy === 'linear') {
        return priority * confidence;
    }
    // Conservative penalizes lower confidence vectors harder.
    if (strategy === 'conservative') {
        return priority * (confidence * confidence);
    }
    return priority;
}
