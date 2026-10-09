import * as fs from 'fs';
import { RecommendationEngineService } from '../apps/api/src/modules/careers/services/recommendationEngine.service';
import { FeatureExtractionService } from '../apps/api/src/modules/careers/services/featureExtraction.service';
import { CareerKnowledgeService } from '../apps/api/src/modules/careers/services/careerKnowledge.service';
import { CombinedRecommendationService } from '../apps/api/src/modules/careers/services/combinedRecommendation.service';

async function run() {
  CareerKnowledgeService.loadCareers();
  const students = JSON.parse(fs.readFileSync('research/data/evaluation/student_dataset_500_minimal.csv', 'utf-8')); // Wait, it's CSV
}

run();
