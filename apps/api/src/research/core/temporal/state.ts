export interface StudentState {
    stateId: string;
    studentId: string;
    sequenceOrder: number;
    timestamp: string;
    proficiencies: Record<string, number>;
    targetCareer: string;
    availableBudgetHours: number;
    provenance: {
        sourceEventId: string | null;
        generator: string;
    };
}
