export type TemporalEventType =
    | 'skill_completed'
    | 'skill_failed'
    | 'skill_regressed'
    | 'new_assessment_evidence'
    | 'market_shift'
    | 'career_goal_change'
    | 'budget_change';

export interface TemporalEvent {
    eventId: string;
    studentId: string;
    eventType: TemporalEventType;
    timestamp: string;
    payload: Record<string, any>;
    provenance: string;
}
