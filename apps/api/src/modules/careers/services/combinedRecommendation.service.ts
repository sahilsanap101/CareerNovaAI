import { RecommendationEngineService, CareerRecommendationResult } from './recommendationEngine.service';
import { FeatureExtractionService } from './featureExtraction.service';
import * as assessmentService from '@/modules/profile/services/assessment.service';
import { CareerKnowledgeService } from './careerKnowledge.service';
import * as profileService from '@/modules/profile/services/profile.service';

const FUSION_WEIGHTS = {
  PROFILE: 0.70,
  ASSESSMENT: 0.30
};

export class CombinedRecommendationService {
  static async recommendCareers(userId: string) {
    // 1. Load authenticated user's profile
    const user = await FeatureExtractionService.fetchStudentData(userId);
    if (!user) throw new Error('User not found');
    
    // 2. Extract profile completion stats to check if profile exists
    const completionStats = await profileService.calculateProfileCompletion(userId);
    const hasProfileData = completionStats.completionPercentage > 20; // arbitrary threshold to mean "profile exists"

    // 3. Load assessment responses
    const [questions, responses] = await Promise.all([
      assessmentService.getQuestions(),
      assessmentService.getUserResponses(userId),
    ]);
    const hasAssessmentData = responses.length > 0;

    // 4. Calculate ProfileScore for all careers
    const normalizedProfile = FeatureExtractionService.extractFeatures(user);
    const profileRecommendations = await RecommendationEngineService.generateRecommendations(normalizedProfile);
    
    // Create a map for quick lookup
    const profileScoreMap = new Map<string, CareerRecommendationResult>();
    for (const rec of profileRecommendations) {
      profileScoreMap.set(rec.careerName, rec);
    }

    // 5. Calculate AssessmentScore for all careers
    const assessmentScoreMap = new Map<string, number>();
    const assessmentEvidenceMap = new Map<string, string[]>();
    
    const careers = CareerKnowledgeService.getCareersForRecommendation();
    const careerNames = careers.map(c => c.name);

    if (hasAssessmentData) {
      const userOptionWeights = responses.map(r => {
        const q = questions.find((question: any) => question.id === r.questionId);
        return { question: q, selectedValue: r.selectedValue };
      });

      for (const careerName of careerNames) {
        let rawScore = 0;
        let maxPossibleScore = 0;
        const evidence: string[] = [];

        for (const { question, selectedValue } of userOptionWeights) {
          if (!question || !question.options) continue;
          
          // Assume max weight per question for ANY career is around 1.0 based on data
          maxPossibleScore += 1.0; 
          
          const option = question.options.find((o: any) => o.value === selectedValue);
          if (!option) continue;
          
          const weights: Record<string, number> = option.careerWeights || {};
          const weight = weights[careerName] || 0;
          
          if (weight > 0) {
            rawScore += weight;
            // Generate evidence
            if (weight >= 0.75) {
              evidence.push(`Assessment answer indicates strong alignment with ${careerName} based on: "${question.question}"`);
            }
          }
        }

        const normalizedScore = maxPossibleScore > 0 ? (rawScore / maxPossibleScore) * 100 : 0;
        assessmentScoreMap.set(careerName, normalizedScore);
        assessmentEvidenceMap.set(careerName, evidence);
      }
    }

    // 6. Normalize & Apply Configurable Fusion Weights
    let finalProfileWeight = FUSION_WEIGHTS.PROFILE;
    let finalAssessmentWeight = FUSION_WEIGHTS.ASSESSMENT;
    let strategyMessage = '';

    if (hasProfileData && !hasAssessmentData) {
      finalProfileWeight = 1.0;
      finalAssessmentWeight = 0.0;
      strategyMessage = 'Complete Career Assessment to improve personalization.';
    } else if (!hasProfileData && hasAssessmentData) {
      finalProfileWeight = 0.0;
      finalAssessmentWeight = 1.0;
      strategyMessage = 'Assessment-assisted recommendation. Complete your profile for better results.';
    } else if (!hasProfileData && !hasAssessmentData) {
      strategyMessage = 'Please complete your profile and career assessment to get personalized recommendations.';
      finalProfileWeight = 1.0; 
      finalAssessmentWeight = 0.0;
    } else {
      strategyMessage = 'Based on your full profile and career assessment.';
    }

    const combinedResults = [];

    for (const career of careers) {
      const profileRec = profileScoreMap.get(career.name);
      
      const pScore = profileRec?.finalScore || 0;
      const aScore = assessmentScoreMap.get(career.name) || 0;

      const combinedScore = (pScore * finalProfileWeight) + (aScore * finalAssessmentWeight);

      // Build Profile Evidence
      const pEvidence = [];
      if (profileRec) {
        pEvidence.push(...profileRec.evidence.academicAlignment);
        pEvidence.push(...profileRec.evidence.projectEvidence);
        pEvidence.push(...profileRec.evidence.goalAlignment);
      }
      
      const aEvidence = assessmentEvidenceMap.get(career.name) || [];

      // Extract matched and missing skills
      const matchedSkills = profileRec?.evidence.skillMatches.map(s => s.skill) || [];
      const missingSkills = profileRec?.evidence.skillGaps.map(s => s.skill) || [];

      let explanation = `This recommendation is based on a combined score. Profile contributed ${(pScore * finalProfileWeight).toFixed(1)} points and Assessment contributed ${(aScore * finalAssessmentWeight).toFixed(1)} points.`;
      
      combinedResults.push({
        careerId: career.id,
        careerName: career.name,
        domain: career.category,
        profileScore: Number(pScore.toFixed(2)),
        assessmentScore: Number(aScore.toFixed(2)),
        combinedScore: Number(combinedScore.toFixed(2)),
        matchedProfileEvidence: pEvidence,
        matchedAssessmentEvidence: aEvidence,
        matchedSkills,
        missingSkills,
        explanation
      });
    }

    // 7. Rank and Select Top 5
    combinedResults.sort((a, b) => b.combinedScore - a.combinedScore);
    const top5 = combinedResults.slice(0, 5).map((r, idx) => ({ ...r, rank: idx + 1 }));

    return {
      strategyMessage,
      recommendations: top5,
      rawProfileCompleteness: completionStats.completionPercentage
    };
  }
}
