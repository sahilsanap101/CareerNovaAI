export interface SkillEvaluationRequest {
    skillId: string;
    studentProficiency: number;
    requiredProficiency: number;
    careerImportance: number;
    marketDemand: number;
    learningCostHours?: number;   // Configurable cost
    prerequisiteStatus: string; // Provided by formal DAG (e.g. 'AVAILABLE')
    provenance: object;         // Evidence tracing
}

export interface SkillPriorityResult {
    skillId: string;
    gap: number;
    careerImportance: number;
    marketDemand: number;
    priorityScore: number;
    normalizedPriority: number;
    learningCost?: number;
    utilityScore?: number;
    prerequisiteStatus: string;
    provenance: object;
}

/**
 * Calculates raw Gap. Bounded to 0 minimum.
 */
export function calculateGap(req: number, student: number): number {
    return Math.max(0, req - student);
}

/**
 * Core Prioritization Logic B2. Multiplies the variables together.
 */
export function evaluateSkillPriority(req: SkillEvaluationRequest): Omit<SkillPriorityResult, 'normalizedPriority'> {
    const gap = calculateGap(req.requiredProficiency, req.studentProficiency);
    const priorityScore = gap * req.careerImportance * req.marketDemand;

    let utilityScore: number | undefined = undefined;
    if (req.learningCostHours !== undefined && req.learningCostHours > 0) {
        const epsilon = 0.0001;
        utilityScore = priorityScore / (req.learningCostHours + epsilon);
    }

    return {
        skillId: req.skillId,
        gap,
        careerImportance: req.careerImportance,
        marketDemand: req.marketDemand,
        priorityScore,
        learningCost: req.learningCostHours,
        utilityScore,
        prerequisiteStatus: req.prerequisiteStatus,
        provenance: req.provenance
    };
}

/**
 * Executes a batch evaluation against all missing skills, sorts them, and normalizes Priority scales 0.0 to 1.0. 
 */
export function runB2Prioritization(requests: SkillEvaluationRequest[]): SkillPriorityResult[] {
    const rawEvaluations = requests.map(evaluateSkillPriority);

    if (rawEvaluations.length === 0) return [];

    const maxPriority = Math.max(...rawEvaluations.map(r => r.priorityScore));
    const minPriority = Math.min(...rawEvaluations.map(r => r.priorityScore));

    const results: SkillPriorityResult[] = rawEvaluations.map(r => {
        let normalizedPriority = 0.5; // Default if identical
        if (maxPriority > minPriority) {
            normalizedPriority = (r.priorityScore - minPriority) / (maxPriority - minPriority);
        }

        return {
            ...r,
            normalizedPriority
        };
    });

    // Sort descending by raw priority
    results.sort((a, b) => b.priorityScore - a.priorityScore);

    return results;
}
