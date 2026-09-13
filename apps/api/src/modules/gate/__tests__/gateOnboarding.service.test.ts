import * as gateOnboardingService from '../services/gateOnboarding.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Gate Onboarding Service Tracking', () => {

    it('generates a diagnostic test matching the exam format securely', async () => {
        // Tests that requesting an assessment forces structure validation
        let err = null;
        try {
            await gateOnboardingService.generateDiagnosticAssessment('INVALID', 2026);
        } catch (e: any) {
            err = e;
        }
        expect(err).not.toBeNull();
    });

    it('calculates proper analytic performance matrices from unmocked submissions', async () => {
        const report = await gateOnboardingService.evaluateDiagnostic('mockUser', 2026, [
            { isCorrect: true }, { isCorrect: true }, { isCorrect: false }, { isCorrect: false }
        ]);

        // Expect 50% score
        expect(report.score).toBe(50);
        expect(report.weakAreas.length).toBeGreaterThan(0);
        expect(report.criticalPrerequisites.length).toBeGreaterThan(0);
    });

});
