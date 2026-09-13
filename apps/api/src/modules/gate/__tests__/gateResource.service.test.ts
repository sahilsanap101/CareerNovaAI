import { PrismaClient } from '@prisma/client';
import * as gateResourceService from '../services/gateResource.service';

const prisma = new PrismaClient();

describe('GATE Learning Resource Intelligence', () => {

    it('forces Official Resources to the top regardless of preferences', async () => {
        jest.spyOn((prisma as any).userGateProfile, 'findUnique').mockResolvedValue({ targetYear: 2024, preferredLearningFormat: 'VIDEO' });

        // Mock returning diverse resources
        jest.spyOn((prisma as any).gateResource, 'findMany').mockResolvedValue([
            { id: '1', title: 'Unofficial Video', resourceType: 'VIDEO', isOfficial: false, isActive: true },
            { id: '2', title: 'Official PDF', resourceType: 'PDF', isOfficial: true, isActive: true }
        ]);

        jest.spyOn((prisma as any).gateTopicMastery, 'findMany').mockResolvedValue([]);

        const results = await gateResourceService.getPersonalizedResources('user1', { paperId: 'cs-24' });

        // Despite user preferring VIDEO, the Official PDF gets +100 priority and forces to TOP!
        expect(results[0].id).toBe('2');
        expect(results[1].id).toBe('1');
    });

    it('injects fallback Official resources if third-party search yields nothing', async () => {
        jest.spyOn((prisma as any).userGateProfile, 'findUnique').mockResolvedValue({});

        // Initial search returns no official content
        const findManySpy = jest.spyOn((prisma as any).gateResource, 'findMany')
            .mockResolvedValueOnce([{ id: 'unoff', isOfficial: false, isActive: true }])
            .mockResolvedValueOnce([{ id: 'official-fallback', isOfficial: true, isActive: true }]); // Secondary fallback query

        jest.spyOn((prisma as any).gateTopicMastery, 'findMany').mockResolvedValue([]);

        const results = await gateResourceService.getPersonalizedResources('user1', { paperId: 'cs-24' });

        expect(findManySpy).toHaveBeenCalledTimes(2); // Proves fallback triggered recursively
        expect(results.some(r => r.id === 'official-fallback')).toBe(true);
        expect(results[0].id).toBe('official-fallback'); // Official scores highest +100
    });

    it('severely penalizes resources marked as not useful', async () => {
        jest.spyOn((prisma as any).userGateProfile, 'findUnique').mockResolvedValue({});

        jest.spyOn((prisma as any).gateResource, 'findMany').mockResolvedValue([
            { id: 'r1', isOfficial: false, isActive: true },
            { id: 'r2', isOfficial: false, isActive: true, actions: [{ actionType: 'NOT_USEFUL', userId: 'user1' }] }
        ]);

        jest.spyOn((prisma as any).gateTopicMastery, 'findMany').mockResolvedValue([]);

        const results = await gateResourceService.getPersonalizedResources('user1', {});

        expect(results[1].id).toBe('r2'); // Penalized -50 points
    });
});
