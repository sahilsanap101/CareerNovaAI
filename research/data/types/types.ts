export interface DatasetMetadata {
    datasetName: string;
    source: string;
    version: string;
    downloadDate: string; // ISO8601
    publicationDate: string | null;
    geographicScope: string;
    temporalScope: string;
    license: string;
    recordCount: number;
    fields: string[];
    preprocessingVersion: string;
    transformationHistory: string[];
    limitations: string[];
}

export interface Skill {
    id: string; // Canonical ID
    name: string;
    category: string;
}

export interface Occupation {
    id: string; // Canonical ID
    title: string;
    description: string;
}

export interface Career {
    id: string; // Canonical ID
    name: string;
}

export interface JobPosting {
    id: string;
    title: string;
    datePosted: string;
    skillsExtracted: string[]; // Array of Canonical Skill IDs
}

export interface Student {
    id: string; // Anonymized
    learningBudget: number; // Hours or cognitive load index
}

export interface StudentSkill {
    studentId: string;
    skillId: string; // Canonical Skill ID
    proficiency: number; // 0.0 to 1.0
    confidence: number;
}

export interface CareerSkill {
    careerId: string;
    skillId: string;
    importanceWeight: number;
}

export interface SkillDependency {
    skillId: string;
    prerequisiteId: string;
}

export interface MarketDemandSnapshot {
    skillId: string;
    timestamp: string;
    demandScore: number;
}

export interface MappingRecord {
    source: string;
    originalValue: string;
    canonicalId: string | null;
    matchingMethod: 'EXACT' | 'FUZZY' | 'LLM_SEMANTIC' | 'MANUAL';
    matchingConfidence: number; // 0.0 to 1.0
    timestamp: string;
}
