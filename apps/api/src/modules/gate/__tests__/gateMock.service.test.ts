import { PrismaClient } from '@prisma/client';
import * as gateMockService from '../services/gateMock.service';

const prisma = new PrismaClient();

describe('GATE Authentic Mock Engine', () => {

    it('rejects custom mock generation if sufficient verified questions are unavailable', async () => {
        // Assume bounding filter only returns 2 verified questions
        jest.spyOn((prisma as any).gateQuestion, 'findMany').mockResolvedValue([
            { id: 'q1', marks: 1 }, { id: 'q2', marks: 2 }
        ]);

        // Trying to generate a 5-question mock
        await expect(gateMockService.generateAuthenticMock({
            userId: 'u1', examId: 'e1', paperId: 'p1', type: 'CUSTOM', count: 5
        })).rejects.toThrow(/Insufficient verified question volume/);
    });

    it('scores MSQ, NAT, and negative MCQ accurately tied to attempting states', async () => {
        // Stub mock lookup
        jest.spyOn((prisma as any).gateMockAttempt, 'findUnique').mockResolvedValue({
            id: 'a1', status: 'IN_PROGRESS',
            mock: {
                questions: [
                    { id: 'q1', questionType: 'MCQ', correctAnswer: 'A', marks: 3 },
                    { id: 'q2', questionType: 'NAT', correctAnswer: '1.2,1.6', marks: 2 },
                    { id: 'q3', questionType: 'MSQ', correctAnswer: '["A","C"]', marks: 2 },
                ]
            }
        });

        jest.spyOn((prisma as any).gateMockAnswer, 'create').mockResolvedValue(true as any);
        const updateSpy = jest.spyOn((prisma as any).gateMockAttempt, 'update').mockResolvedValue(true as any);
        jest.spyOn((prisma as any).gateMockAnalytics, 'create').mockResolvedValue(true as any);

        const payload = {
            answers: {
                'q1': 'B', // Incorrect MCQ -> penalty -1 (3/3)
                'q2': '1.4', // Correct NAT within bounds -> +2
                'q3': ['A', 'C'], // Correct MSQ exact -> +2
            }
        };

        const result = await gateMockService.submitMockAttempt('a1', payload);

        // Score should be -> -1 + 2 + 2 = 3
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ score: 3 })
        }));

        expect(result.analytics.marksLost).toBe(1);
        expect(result.analytics.correct).toBe(2);
        expect(result.analytics.incorrect).toBe(1);
    });
});
