import { MappingRecord, Skill } from '../types/types';

/**
 * Temporary mock store for the canonical skill registry.
 * In production, this would be backed by the processed canonical database.
 */
const CANONICAL_SKILL_REGISTRY: Map<string, Skill> = new Map([
    ['skill_python_01', { id: 'skill_python_01', name: 'Python', category: 'Programming' }],
    ['skill_react_01', { id: 'skill_react_01', name: 'React', category: 'Frontend' }],
]);

/**
 * The Unmatched Entity Queue stores items that failed to cross the confidence threshold.
 * It prevents silent discarding of data.
 */
export const UNMATCHED_ENTITY_QUEUE: Array<{ source: string; originalValue: string; reason: string }> = [];

/**
 * The Mapping Operations Log stores provenance tracking for every resolution attempted.
 */
export const MAPPING_LOG: MappingRecord[] = [];

const MATCH_THRESHOLD = 0.85;

/**
 * Calculates a basic similarity score (placeholder for actual Jaro-Winkler or Embeddings).
 */
function calculateSimilarity(sourceString: string, targetString: string): number {
    const normSource = sourceString.toLowerCase().trim();
    const normTarget = targetString.toLowerCase().trim();
    if (normSource === normTarget) return 1.0;
    if (normSource.includes(normTarget) || normTarget.includes(normSource)) return 0.8;
    return 0.0;
}

/**
 * Entity Resolution Pipeline
 * Maps a raw skill string from an external dataset to a Canonical Skill ID.
 */
export function resolveSkill(
    rawSkillString: string,
    sourceDataset: 'ONET' | 'ESCO' | 'JOB_POSTING' | 'PathForge_LEGACY'
): string | null {

    let bestMatchId: string | null = null;
    let highestScore = 0;
    let matchMethod: MappingRecord['matchingMethod'] = 'FUZZY';

    // 1. Attempt Matching
    for (const [canonicalId, canonicalSkill] of CANONICAL_SKILL_REGISTRY.entries()) {
        const score = calculateSimilarity(rawSkillString, canonicalSkill.name);
        if (score > highestScore) {
            highestScore = score;
            bestMatchId = canonicalId;
            matchMethod = score === 1.0 ? 'EXACT' : 'FUZZY';
        }
    }

    // 2. Evaluate Threshold
    if (highestScore >= MATCH_THRESHOLD && bestMatchId) {
        // Record Success
        MAPPING_LOG.push({
            source: sourceDataset,
            originalValue: rawSkillString,
            canonicalId: bestMatchId,
            matchingMethod: matchMethod,
            matchingConfidence: highestScore,
            timestamp: new Date().toISOString()
        });
        return bestMatchId;
    } else {
        // Record Failure (Do not silently discard)
        UNMATCHED_ENTITY_QUEUE.push({
            source: sourceDataset,
            originalValue: rawSkillString,
            reason: `Similarity score ${highestScore} below threshold ${MATCH_THRESHOLD}`
        });
        MAPPING_LOG.push({
            source: sourceDataset,
            originalValue: rawSkillString,
            canonicalId: null,
            matchingMethod: highestScore > 0 ? 'FUZZY' : 'EXACT',
            matchingConfidence: highestScore,
            timestamp: new Date().toISOString()
        });
        return null;
    }
}
