import { PrismaClient } from '@prisma/client';
import * as gateQuestionService from '../services/gateQuestion.service';

const prisma = new PrismaClient();

describe('GATE PYQ Native Evaluation Engine', () => {
    it('accurately enforces MCQ negative 1/3 penalty marking', async () => {
        jest.spyOn((prisma as any).gateQuestion, 'findUnique').mockResolvedValue({
            id: 'demo-mcq',
            questionType: 'MCQ',
            marks: 3.0,
            correctAnswer: 'B',
            topicId: 'T1'
        });

        jest.spyOn((prisma as any).gateQuestionAttempt, 'create').mockResolvedValue({} as any);
        jest.spyOn((prisma as any).gateTopicMastery, 'findFirst').mockResolvedValue(null);
        jest.spyOn((prisma as any).gateTopicMastery, 'create').mockResolvedValue({} as any);

        const incorrectEval = await gateQuestionService.recordAttempt('U1', { questionId: 'demo-mcq', answerKey: 'A' });
        expect(incorrectEval.isCorrect).toBe(false);
        expect(incorrectEval.earnedMarks).toBeCloseTo(-1.0); // 3.0 marks / 3 penalty

        const correctEval = await gateQuestionService.recordAttempt('U1', { questionId: 'demo-mcq', answerKey: 'B' });
        expect(correctEval.isCorrect).toBe(true);
        expect(correctEval.earnedMarks).toBe(3.0);
    });

    it('accuarately enforces MSQ partial logic (No negative marking)', async () => {
        jest.spyOn((prisma as any).gateQuestion, 'findUnique').mockResolvedValue({
            id: 'demo-msq',
            questionType: 'MSQ',
            marks: 2.0,
            correctAnswer: 'A,C', // Exactly A & C
            topicId: 'T1'
        });

        const partialEval = await gateQuestionService.recordAttempt('U1', { questionId: 'demo-msq', answerKey: 'A' });
        expect(partialEval.isCorrect).toBe(false);
        expect(partialEval.earnedMarks).toBe(0); // MSQ NO PENALTY

        const correctEval = await gateQuestionService.recordAttempt('U1', { questionId: 'demo-msq', answerKey: 'C,A' }); // Reverse order string
        expect(correctEval.isCorrect).toBe(true);
    });

    it('NAT correctly matches decimal bounds tolerances', async () => {
        jest.spyOn((prisma as any).gateQuestion, 'findUnique').mockResolvedValue({
            id: 'demo-nat',
            questionType: 'NAT',
            marks: 1.0,
            correctAnswer: JSON.stringify({ min: 1.05, max: 1.15 }),
            topicId: 'T1'
        });

        const correctEval = await gateQuestionService.recordAttempt('U1', { questionId: 'demo-nat', answerKey: "1.10" });
        expect(correctEval.isCorrect).toBe(true);

        const looseEval = await gateQuestionService.recordAttempt('U1', { questionId: 'demo-nat', answerKey: "1.06" });
        expect(looseEval.isCorrect).toBe(true);

        const wrongEval = await gateQuestionService.recordAttempt('U1', { questionId: 'demo-nat', answerKey: "1.16" });
        expect(wrongEval.isCorrect).toBe(false);
        expect(wrongEval.earnedMarks).toBe(0); // NAT NO PENALTY
    });
});
