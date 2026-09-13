import { PrismaClient } from '@prisma/client';
import * as gateRevisionService from '../services/gateRevision.service';

const prisma = new PrismaClient();

describe('GATE Mistake Book and Revision System', () => {

    it('advances review dates cleanly scaled by performance limit rather than faking retention mapping', async () => {
        jest.spyOn((prisma as any).gateRevisionQueue, 'findFirst').mockResolvedValue({
            id: 'req1', userId: 'usr', topicId: 't1', reviewCount: 2
        });

        const updateSpy = jest.spyOn((prisma as any).gateRevisionQueue, 'update').mockResolvedValue(true as any);

        // Good performance (80+), advances nextCount * 3 = 9 days!
        const result = await gateRevisionService.evaluateRevision('usr', 't1', 85.0);

        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ reviewCount: 3 })
        }));
        expect(result.appliedIntervalDays).toBe(9);
    });

    it('heavily penalizes failed revision tests explicitly collapsing the retention streak', async () => {
        jest.spyOn((prisma as any).gateRevisionQueue, 'findFirst').mockResolvedValue({
            id: 'req2', userId: 'usr', topicId: 't2', reviewCount: 4
        });

        const decrementSpy = jest.spyOn((prisma as any).gateTopicMastery, 'updateMany').mockResolvedValue(true as any);
        const updateSpy = jest.spyOn((prisma as any).gateRevisionQueue, 'update').mockResolvedValue(true as any);

        // Failing heavily (< 50) resets back to Tomorrow bounds
        const result = await gateRevisionService.evaluateRevision('usr', 't2', 30.0);

        expect(decrementSpy).toHaveBeenCalledWith(expect.objectContaining({
            data: { masteryLevel: { decrement: 5.0 } }
        }));
        expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ reviewCount: 0 })
        }));
        expect(result.appliedIntervalDays).toBe(1);
    });
});
