export interface SkillEvaluationRequest {
    skillId: string;
    studentProficiency?: number;
    requiredProficiency?: number;
    careerImportance?: number;
    marketDemand?: number;
    learningCostHours?: number;   // Configurable cost
    prerequisiteStatus?: string; // Provided by formal DAG (e.g. 'AVAILABLE')
    provenance?: object;         // Evidence tracing
}

export interface SkillPriorityResult {
    skillId: string;
    gap: number;
    careerImportance: number;
    marketDemand: number;
    priorityScore: number;
    normalizedPriority: number;
    learningCost: number;
    utilityScore: number;
    prerequisiteStatus: string;
    provenance: object;
}

/**
 * Calculates raw Gap. Bounded to 0 minimum.
 * Handles missing or invalid inputs securely by defaulting to 0.0.
 */
export function calculateGap(req?: number, student?: number): number {
    const r = (typeof req === 'number' && !isNaN(req)) ? req : 0.0;
    const s = (typeof student === 'number' && !isNaN(student)) ? student : 0.0;
    return Math.max(0, r - s);
}

/**
 * Core Prioritization Logic B2. Multiplies the explicit scalar variables together.
 */
export function evaluateSkillPriority(req: SkillEvaluationRequest): Omit<SkillPriorityResult, 'normalizedPriority'> {
    const gap = calculateGap(req.requiredProficiency, req.studentProficiency);

    // Explicit numerical defaults for strict determinism and handling unknown metrics
    const wC = (typeof req.careerImportance === 'number' && !isNaN(req.careerImportance)) ? req.careerImportance : 0.0;
    const mT = (typeof req.marketDemand === 'number' && !isNaN(req.marketDemand)) ? req.marketDemand : 0.0;
    const cost = (typeof req.learningCostHours === 'number' && !isNaN(req.learningCostHours)) ? req.learningCostHours : 10.0;

    const priorityScore = gap * wC * mT;

    // Optional cost-adjusted utility (Priority / (Cost(s) + epsilon))
    const epsilon = 0.0001;
    const safeCost = Math.max(0, cost);
    const utilityScore = priorityScore / (safeCost + epsilon);

    return {
        skillId: req.skillId || 'UNKNOWN_SKILL',
        gap,
        careerImportance: wC,
        marketDemand: mT,
        priorityScore,
        learningCost: cost,
        utilityScore,
        prerequisiteStatus: req.prerequisiteStatus || 'UNKNOWN',
        provenance: req.provenance || {}
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
        let normalizedPriority = 0.5; // Default if all have identical priority
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
