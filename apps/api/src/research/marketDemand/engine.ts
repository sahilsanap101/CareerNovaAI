export interface ProvenanceMetadata {
    sourceDataset: string;
    dateRange: { start: string; end: string };
    geography: string;
    processingVersion: string;
}

export interface DemandValue {
    skillId: string;
    careerId?: string;
    value: number; // Raw frequency or score
    sampleSize: number;
    confidenceLowerBound?: number;
    provenance: ProvenanceMetadata;
}

export interface SimpleJobPosting {
    id: string;
    careerId?: string;
    skillsExtracted: string[];
}

/**
 * 1 & 3: Global or Career-Specific Frequency
 * Calculates proportional occurrence of a skill and computes the Wilson Score Interval limit.
 */
export function calculateFrequency(
    postingsSubset: SimpleJobPosting[],
    skillId: string,
    provenance: ProvenanceMetadata,
    careerId?: string
): DemandValue {
    if (postingsSubset.length === 0) {
        return { skillId, careerId, value: 0, sampleSize: 0, confidenceLowerBound: 0, provenance };
    }

    const count = postingsSubset.filter(p => p.skillsExtracted.includes(skillId)).length;
    const n = postingsSubset.length;
    const p = count / n;

    // 95% Confidence Wilson Score Interval
    const z = 1.96;
    const denominator = 1 + (z * z) / n;
    const centreAdj = p + (z * z) / (2 * n);
    const spread = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
    const lowerBound = (centreAdj - spread) / denominator;

    return {
        skillId,
        careerId,
        value: p,
        sampleSize: n,
        confidenceLowerBound: Math.max(0, lowerBound),
        provenance
    };
}

/**
 * 2: Normalized Frequency Score
 * Linearly scales the dataset via min-max formula for ranking utility.
 */
export function normalizeFrequencies(demandList: DemandValue[]): DemandValue[] {
    if (demandList.length === 0) return [];
    const min = Math.min(...demandList.map(d => d.value));
    const max = Math.max(...demandList.map(d => d.value));

    if (min === max) {
        // If all skills occur exactly identically, normalize them to 0.5 middleweight.
        return demandList.map(d => ({ ...d, value: 0.5 }));
    }

    return demandList.map(d => ({
        ...d,
        value: (d.value - min) / (max - min)
    }));
}

/**
 * 4: Market Share
 * Measures ratio of skill requests in target career vs global applicability.
 */
export function calculateMarketShare(
    careerPostingsWithSkillCount: number,
    globalPostingsWithSkillCount: number,
    skillId: string,
    careerId: string,
    provenance: ProvenanceMetadata
): DemandValue {
    const value = globalPostingsWithSkillCount === 0
        ? 0
        : careerPostingsWithSkillCount / globalPostingsWithSkillCount;

    return {
        skillId,
        careerId,
        value,
        sampleSize: globalPostingsWithSkillCount,
        provenance
    };
}

/**
 * 5: Temporal Trend
 * Measures velocity of demand (t2 vs t1). Uses epsilon floor to avoid inf-div.
 */
export function calculateTemporalTrend(
    demandT1: number,
    demandT2: number,
    skillId: string,
    careerId: string,
    provenance: ProvenanceMetadata
): DemandValue {
    const epsilon = 0.0001;
    const safeT1 = Math.max(demandT1, epsilon);
    const trend = (demandT2 - safeT1) / safeT1;

    return {
        skillId,
        careerId,
        value: trend,
        sampleSize: 0,
        provenance
    };
}
