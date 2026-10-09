import * as fs from 'fs';
import * as path from 'path';
import * as assessmentRepo from '../repositories/assessment.repository';
import { AppError } from '@/middleware/error.middleware';
import { HTTP_STATUS, ERROR_CODES } from '@pathforge/shared-constants';

export async function getQuestions() {
  const jsonPath = path.resolve(process.cwd(), 'research/data/collection/career_assessment_questions_v1.json');
  if (!fs.existsSync(jsonPath)) {
    return assessmentRepo.getQuestions();
  }
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  return data.map((q: any) => ({
    id: q.question_id,
    question: q.question_text,
    section: `Dimension ${q.dim}`,
    required: true,
    options: [
      { id: `${q.question_id}_1`, value: '1', label: 'Strongly Disagree', careerWeights: Object.fromEntries(Object.entries(q.career_weights || {}).map(([k,v]) => [k, Number(v)*0.0])) },
      { id: `${q.question_id}_2`, value: '2', label: 'Disagree', careerWeights: Object.fromEntries(Object.entries(q.career_weights || {}).map(([k,v]) => [k, Number(v)*0.25])) },
      { id: `${q.question_id}_3`, value: '3', label: 'Neutral', careerWeights: Object.fromEntries(Object.entries(q.career_weights || {}).map(([k,v]) => [k, Number(v)*0.50])) },
      { id: `${q.question_id}_4`, value: '4', label: 'Agree', careerWeights: Object.fromEntries(Object.entries(q.career_weights || {}).map(([k,v]) => [k, Number(v)*0.75])) },
      { id: `${q.question_id}_5`, value: '5', label: 'Strongly Agree', careerWeights: Object.fromEntries(Object.entries(q.career_weights || {}).map(([k,v]) => [k, Number(v)*1.0])) }
    ]
  }));
}

export async function getUserResponses(userId: string) {
  return assessmentRepo.getUserResponses(userId);
}

export async function saveResponse(userId: string, questionId: string, selectedValue: string) {
  return assessmentRepo.saveResponse(userId, questionId, selectedValue);
}

export async function getAssessmentCompletion(userId: string) {
  const [questions, responses] = await Promise.all([
    getQuestions(),
    getUserResponses(userId),
  ]);

  const requiredQuestions = questions.filter(q => q.required);
  const answeredRequired = requiredQuestions.filter(q => 
    responses.some(r => r.questionId === q.id)
  );

  return {
    isComplete: answeredRequired.length === requiredQuestions.length,
    totalRequired: requiredQuestions.length,
    answeredRequired: answeredRequired.length,
    percentage: requiredQuestions.length === 0 ? 100 : Math.round((answeredRequired.length / requiredQuestions.length) * 100),
  };
}

export async function submitAssessment(userId: string) {
  const completion = await getAssessmentCompletion(userId);
  if (!completion.isComplete) {
    throw new AppError('Cannot submit incomplete assessment', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.SERVER_001);
  }
  // The assessment responses are already saved individually via saveResponse.
  // We just return success. If we need to process or calculate career paths based on this later, it can be done here or asynchronously.
  return { success: true, ...completion };
}
