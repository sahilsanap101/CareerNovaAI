import { Transition } from './transition';
import { StudentState } from './state';
import { TemporalEvent } from './events';

describe('B4 Longitudinal Event Constraints', () => {
    let baseState: StudentState;

    beforeEach(() => {
        baseState = {
            stateId: 'S_u1_0',
            studentId: 'u1',
            sequenceOrder: 0,
            timestamp: 'T0',
            proficiencies: { 'A': 0.5, 'B': 0.0 },
            targetCareer: 'c1',
            availableBudgetHours: 100,
            provenance: { sourceEventId: null, generator: 'init' }
        };
    });

    it('processes skill_completed correctly', () => {
        const ev: TemporalEvent = {
            eventId: 'ev1', studentId: 'u1', eventType: 'skill_completed', timestamp: 'T1',
            payload: { skillId: 'A', costSpent: 20 }, provenance: 'SIM'
        };
        const next = Transition(baseState, ev);
        expect(next.proficiencies['A']).toBe(1.0);
        expect(next.availableBudgetHours).toBe(80);
        expect(next.sequenceOrder).toBe(1);
    });

    it('processes skill_regressed correctly', () => {
        const ev: TemporalEvent = {
            eventId: 'ev2', studentId: 'u1', eventType: 'skill_regressed', timestamp: 'T2',
            payload: { skillId: 'A', amount: 0.2 }, provenance: 'SIM'
        };
        const next = Transition(baseState, ev);
        expect(next.proficiencies['A']).toBeCloseTo(0.3);
    });

    it('processes skill_failed appropriately', () => {
        const ev: TemporalEvent = {
            eventId: 'ev3', studentId: 'u1', eventType: 'skill_failed', timestamp: 'T3',
            payload: { skillId: 'A', costSpent: 10 }, provenance: 'SIM'
        };
        const next = Transition(baseState, ev);
        expect(next.proficiencies['A']).toBe(0.5); // Unchanged proficiency
        expect(next.availableBudgetHours).toBe(90); // Consumed budget
    });

    it('processes market_shift without mutating local proficiencies', () => {
        const ev: TemporalEvent = {
            eventId: 'ev4', studentId: 'u1', eventType: 'market_shift', timestamp: 'T4',
            payload: {}, provenance: 'SIM'
        };
        const next = Transition(baseState, ev);
        expect(next.proficiencies['A']).toBe(0.5);
    });

    it('preserves immutability of historical states', () => {
        const ev: TemporalEvent = {
            eventId: 'ev5', studentId: 'u1', eventType: 'budget_change', timestamp: 'T5',
            payload: { newBudget: 50 }, provenance: 'SIM'
        };
        const next = Transition(baseState, ev);
        expect(next.availableBudgetHours).toBe(50);
        expect(baseState.availableBudgetHours).toBe(100); // Original unscathed
        expect(baseState.stateId).not.toBe(next.stateId);
    });
});
