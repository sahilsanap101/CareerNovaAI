import { RoadmapEvaluationOutput } from '../../evaluation/runners/types';

export interface ExplanationBlock {
    skillsPossessed: string[];
    skillGapsEvaluated: string[];
    evidenceSourcesReferenced: string[];
    marketInformationWeight: string;
    prerequisitesConsidered: string[];
    assumptions: string;
    systemUncertainty: string;
}

export interface TransparencyLogPayload {
    logId: string;
    algorithmVersion: string;
    modelParamVersion: string;
    roadmapVersionId: string;
    dataProvenanceReference: string;
    generatedExplanations: ExplanationBlock;
    disclaimer: string;
    computationTimestamp: string;
}

/**
 * Ensures system outputs are intrinsically bound to academic disclaimer boundaries and strictly track the algorithmic variables creating them.
 */
export class ResponsibleSafetyLogger {

    private static readonly DISCLAIMER_TEXT = "PathForge provides decision support and does not determine a student's career outcome.";

    public static generateTransparencyLog(
        roadmapOut: RoadmapEvaluationOutput[],
        algoVer: string,
        modelVer: string,
        provRef: string
    ): TransparencyLogPayload {

        // Extrapolates aggregate evidence explicitly from sequence constraints
        const gaps = roadmapOut.map(r => r.skillId);
        const requiredPrereqs = [...new Set(roadmapOut.flatMap(r => r.prerequisites || []))];

        const log: TransparencyLogPayload = {
            logId: `RLOG_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            algorithmVersion: algoVer,
            modelParamVersion: modelVer,
            roadmapVersionId: `RV_${Date.now()}`,
            dataProvenanceReference: provRef,
            disclaimer: this.DISCLAIMER_TEXT,
            computationTimestamp: new Date().toISOString(),
            generatedExplanations: {
                skillsPossessed: ['Aggregated from StudentState matrix...'], // Omitted logic abstraction for stub 
                skillGapsEvaluated: gaps,
                evidenceSourcesReferenced: ['Synthetic_Student_Baseline_v01', provRef],
                marketInformationWeight: `Market priority scalar bounded explicitly at algorithm constraints.`,
                prerequisitesConsidered: requiredPrereqs,
                assumptions: "Linearly correlates defined sub-skills directly to macro job viability natively assuming stable labor velocity.",
                systemUncertainty: "Score probabilities reflect historic arrays; algorithms possess zero deterministic temporal foresight."
            }
        };

        return log;
    }

    public static auditProtectedAttributes(studentObject: any): boolean {
        const protectedKeys = ['name', 'gender', 'religion', 'caste', 'ethnicity', 'political', 'financial', 'health'];
        let safe = true;
        for (const key of protectedKeys) {
            if (studentObject.hasOwnProperty(key)) {
                console.warn(`[SAFETY AUDIT VIOLATION] Protected attribute [${key}] evaluated in computation bounds!`);
                safe = false;
            }
        }
        return safe;
    }
}
