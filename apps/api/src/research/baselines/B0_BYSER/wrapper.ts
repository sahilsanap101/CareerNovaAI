// @ts-nocheck
import {
    evaluateCareerPath,
    StudentProfileForEngine,
    CareerPathForEngine
} from '../../../modules/recommendations/engine/byserEngine';

export interface B0EvaluationOutput {
    career_id: string;
    score: number;
    rank: number;
    factor_scores: Array<{ factor: string; score: number }>;
    missing_skills: string[];
    strengths: string[];
    match_score: number; // Renamed from "confidence" for mathematical integrity
}

/**
 * Executes a deterministic batch run of the BYSER baseline scoring algorithm
 * over a provided set of target career paths.
 */
export function runB0Evaluation(
    studentContext: StudentProfileForEngine,
    availableCareers: CareerPathForEngine[]
): B0EvaluationOutput[] {

    const rawResults = availableCareers.map(career => evaluateCareerPath(studentContext, career));

    // Sort by total heuristic score descending
    rawResults.sort((a, b) => b.totalScore - a.totalScore);

    return rawResults.map((res, index) => ({
        career_id: res.careerPathId,
        score: res.totalScore,
        rank: index + 1,
        factor_scores: res.factors.map(f => ({
            factor: f.factor,
            score: f.score
        })),
        missing_skills: res.explanation.missingSkills.map(m => m.name),
        strengths: res.explanation.strengths,
        match_score: res.match_score // Plucked from 'match_score' 
    }));
}
