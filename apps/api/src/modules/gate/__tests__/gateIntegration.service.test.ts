import { PrismaClient } from '@prisma/client';
import * as gateIntegrationService from '../services/gateIntegration.service';

jest.mock('../services/gateReadiness.service', () => ({
    computeReadinessAnalytics: jest.fn().mockResolvedValue({ overallReadiness: 60 })
}));

const prisma = new PrismaClient();

describe('GATE CareerNova Orchestration', () => {
    it('shifts bounds to panic mode dynamically tracking explicit dates <30 days', async () => {
        jest.spyOn((prisma as any).gateExam, 'findFirst').mockResolvedValue({ year: '2025' });

        // Force a date explicitly 10 days before Feb 1, 2025
        const simulatedDate = '2025-01-20T00:00:00Z';

        const res = await gateIntegrationService.calculateTimeAllocation('usr', '2025', { simulatedDate });
        expect(res.allocation.GATE).toBe(80); // Natively burns proj vectors to 0/10
        expect(res.allocation.PROJECTS).toBe(0);
    });

    it('relaxes bounds elegantly tracing safe readiness limits scaling back DSA dynamically', async () => {
        jest.spyOn((prisma as any).gateExam, 'findFirst').mockResolvedValue({ year: '2025' });
        // Override mock just for the positive test limit
        const readmock = require('../services/gateReadiness.service');
        readmock.computeReadinessAnalytics.mockResolvedValueOnce({ overallReadiness: 90 });

        // Far out proximities (October)
        const simulatedDate = '2024-10-01T00:00:00Z';

        const res = await gateIntegrationService.calculateTimeAllocation('usr', '2025', { simulatedDate });
        // Base is 40. 90 Readiness relaxes constraints -15 -> 25% GATE
        expect(res.allocation.GATE).toBe(25);
        expect(res.allocation.DSA).toBe(40);
    });
});
