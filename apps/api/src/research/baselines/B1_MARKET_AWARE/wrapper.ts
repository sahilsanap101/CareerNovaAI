import {
    MarketAwareRanker,
    B1StudentState,
    B1CareerState,
    B1RankerResult,
    DemandFetcher,
    ConfigWeights
} from './ranker';

export interface B1EvaluationOutput {
    career_id: string;
    score: number;
    rank: number;
    skill_fit: number;
    goal_fit: number;
    interest_fit: number;
    market_alignment: number;
    explanation: object;
}

/**
 * Executes a deterministic run of the B1 Market-Aware Research Model.
 */
export function runB1Evaluation(
    student: B1StudentState,
    careers: B1CareerState[],
    demandModel: DemandFetcher,
    experimentalWeights?: ConfigWeights
): B1EvaluationOutput[] {

    const ranker = new MarketAwareRanker(experimentalWeights);
    const rawResults: B1RankerResult[] = careers.map(career => ranker.rankCareer(student, career, demandModel));

    // Sort descending by score
    rawResults.sort((a, b) => b.score - a.score);

    return rawResults.map((res, index) => ({
        career_id: res.career_id,
        score: res.score,
        rank: index + 1,
        skill_fit: res.skill_fit,
        goal_fit: res.goal_fit,
        interest_fit: res.interest_fit,
        market_alignment: res.market_alignment,
        explanation: res.explanation
    }));
}
