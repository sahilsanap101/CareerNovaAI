import { PrismaClient } from '@prisma/client';
import * as gatePlannerService from '../services/gatePlanner.service';

const prisma = new PrismaClient();

jest.mock('../services/gateGraph.service', () => ({
    calculateTopicPriority: jest.fn().mockImplementation((userId, topicId) => {
        // Return a mock static high priority for target topics
        return { priorityScore: topicId === 'T1' ? 95 : 20 };
    }),
    getDownstreamImpact: jest.fn().mockReturnValue([])
}));

describe('GATE Adaptive Planner', () => {

    it('allocates Remediation tasks mapping strict mistake constraints', async () => {
        jest.spyOn((prisma as any).userGateProfile, 'findUnique').mockResolvedValue({ targetYear: 2024, weeklyStudyHours: 14 });
        jest.spyOn((prisma as any).gateStudyPlan, 'findFirst').mockResolvedValue({ id: 'P1' });

        // Mock a pending Mistake mapping directly to topic T1
        jest.spyOn((prisma as any).gateMistakeTracker, 'findMany').mockResolvedValue([
            { resolved: false, question: { topicId: 'T1' } }
        ]);

        jest.spyOn((prisma as any).gateSyllabusTopic, 'findMany').mockResolvedValue([
            { id: 'T2', prerequisitesGateTarget: [] },
            { id: 'T1', prerequisitesGateTarget: [] }
        ]);

        jest.spyOn((prisma as any).gateStudySession, 'deleteMany').mockResolvedValue(true as any);
        const createSpy = jest.spyOn((prisma as any).gateStudySession, 'create').mockResolvedValue(true as any);
        jest.spyOn((prisma as any).gateTopicMastery, 'findMany').mockResolvedValue([]);
        jest.spyOn((prisma as any).gateStudySession, 'findMany').mockResolvedValue([]);

        await gatePlannerService.generateDailyPlan('U1');

        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                topicId: 'T1',
                title: expect.stringContaining('Remediation:')
            })
        }));
    });
});
