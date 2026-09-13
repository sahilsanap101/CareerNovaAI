import { PrismaClient } from '@prisma/client';
import * as gatePracticeService from '../services/gatePractice.service';

const prisma = new PrismaClient();

describe('GATE Error Intelligence Engine', () => {

    it('triggers Foundation Review recommendations on 3 consecutive conceptual failures', async () => {
        // Mock returning 3 recent unresolved CONCEPTUAL failures mapped
        jest.spyOn((prisma as any).gateMistakeTracker, 'findMany').mockResolvedValue([
            { mistakeType: 'CONCEPTUAL' },
            { mistakeType: 'CONCEPTUAL' },
            { mistakeType: 'CONCEPTUAL' },
        ]);
        jest.spyOn((prisma as any).gateQuestion, 'findUnique').mockResolvedValue({
            id: 'demo',
            questionType: 'MCQ',
            marks: 3.0,
            correctAnswer: 'B',
            topicId: 'T1'
        });
        jest.spyOn((prisma as any).gateQuestionAttempt, 'create').mockResolvedValue({} as any);
        jest.spyOn((prisma as any).gateMistakeTracker, 'create').mockResolvedValue({} as any);
        jest.spyOn((prisma as any).gateTopicMastery, 'findFirst').mockResolvedValue(null);
        jest.spyOn((prisma as any).gateTopicMastery, 'create').mockResolvedValue({} as any);

        const evalResult = await gatePracticeService.recordPracticeAttempt('user1', {
            questionId: 'demo', answerKey: 'A', mistakeType: 'CONCEPTUAL' // failed evaluate
        });

        expect(evalResult.isCorrect).toBe(false);
        expect(evalResult.recommendations.some(r => r.includes("Repeated Conceptual Failure Detected"))).toBe(true);
    });

    it('updates mastery natively without dummy completed toggles', async () => {
        jest.spyOn((prisma as any).gateMistakeTracker, 'findMany').mockResolvedValue([]);
        jest.spyOn((prisma as any).gateQuestion, 'findUnique').mockResolvedValue({
            id: 'demo-2',
            questionType: 'MCQ',
            difficulty: 'HARD', // Add bonuses to mastery securely
            marks: 2.0,
            correctAnswer: 'C',
            topicId: 'T1'
        });

        const existingMastery = { id: 'mastery-1', masteryLevel: 50 };
        jest.spyOn((prisma as any).gateTopicMastery, 'findFirst').mockResolvedValue(existingMastery);
        const updateSpy = jest.spyOn((prisma as any).gateTopicMastery, 'update').mockResolvedValue({} as any);

        let evalResult = await gatePracticeService.recordPracticeAttempt('user1', {
            questionId: 'demo-2', answerKey: 'C', confidence: 'HIGH'
        });

        expect(evalResult.isCorrect).toBe(true);
        // Correct (+3 Base) + Hard (+2) = +5 expected update over existing 50
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            data: { masteryLevel: 55 }
        }));
    });
});
