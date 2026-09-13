import { StudentState } from './state';
import { TemporalEvent } from './events';

/**
 * Deterministic B4 Transition Function mapping $S_{t+1} = Transition(S_t, E_t)$
 */
export function Transition(currentState: StudentState, event: TemporalEvent): StudentState {
    // Deep clone to enforce immutability requirement natively
    const nextState: StudentState = JSON.parse(JSON.stringify(currentState));

    nextState.sequenceOrder += 1;
    nextState.timestamp = event.timestamp;
    nextState.stateId = `S_${nextState.studentId}_${nextState.sequenceOrder}`;
    nextState.provenance.sourceEventId = event.eventId;

    switch (event.eventType) {
        case 'skill_completed': {
            const sId = event.payload.skillId as string;
            nextState.proficiencies[sId] = 1.0;
            const cost = event.payload.costSpent || 0;
            nextState.availableBudgetHours = Math.max(0, nextState.availableBudgetHours - cost);
            break;
        }
        case 'skill_failed': {
            // Consumes budget, proficiency does not jump
            const cost = event.payload.costSpent || 0;
            nextState.availableBudgetHours = Math.max(0, nextState.availableBudgetHours - cost);
            break;
        }
        case 'skill_regressed': {
            const sId = event.payload.skillId as string;
            const drop = event.payload.amount || 0.5;
            const current = nextState.proficiencies[sId] || 0.0;
            nextState.proficiencies[sId] = Math.max(0, current - drop);
            break;
        }
        case 'new_assessment_evidence': {
            const sId = event.payload.skillId as string;
            nextState.proficiencies[sId] = event.payload.level as number;
            break;
        }
        case 'career_goal_change': {
            nextState.targetCareer = event.payload.newCareer as string;
            break;
        }
        case 'budget_change': {
            nextState.availableBudgetHours = event.payload.newBudget as number;
            break;
        }
        case 'market_shift': {
            // System marker triggering priorities to recalculate globally.
            // Local student object maintains pure state.
            break;
        }
        default:
            throw new Error(`Unsupported explicit event type: ${event.eventType}`);
    }

    return nextState;
}
