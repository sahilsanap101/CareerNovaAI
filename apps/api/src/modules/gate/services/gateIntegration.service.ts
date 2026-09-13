import { PrismaClient } from '@prisma/client';
import { computeReadinessAnalytics } from './gateReadiness.service';

const prisma = new PrismaClient();

export const calculateTimeAllocation = async (userId: string, year: string, overrides: any = null) => {
    // Determine proximity
    const exam = await (prisma as any).gateExam.findFirst({ where: { year } });
    const profile = await (prisma as any).userGateProfile.findFirst({ where: { userId, targetYear: year } });

    if (!exam) throw new Error("GATE Exam binding missing.");

    // Using a default target date if paper specific date requires additional resolution, assuming Feb 1st
    const examDate = new Date(`${year}-02-01T09:00:00Z`);
    const today = overrides?.simulatedDate ? new Date(overrides.simulatedDate) : new Date();

    // Bounds proximity in days
    const proximityDays = Math.max(0, Math.floor((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    // Extract readiness
    const readiness = await computeReadinessAnalytics(userId, year);

    // DYNAMIC TIME ALLOCATION MATH (Baseline = 100%)
    let gatePct = 40;
    let dsaPct = 30;
    let projPct = 20;
    let intPct = 10;

    // 1. Proximity Shift
    if (proximityDays < 30) {
        // Exam mode: Burn everything for GATE
        gatePct = 80;
        dsaPct = 10;
        projPct = 0;
        intPct = 10;
    } else if (proximityDays < 90) {
        // Intermediate shift
        gatePct = 60;
        dsaPct = 20;
        projPct = 10;
        intPct = 10;
    }

    // 2. Readiness Overrides
    // If readiness is exceptionally high, loosen GATE constraints early
    if (readiness.overallReadiness >= 85 && proximityDays > 30) {
        gatePct -= 15;
        dsaPct += 10;
        projPct += 5;
    }

    // If readiness is crashing in panic zone
    if (readiness.overallReadiness < 30 && proximityDays < 90) {
        gatePct = 90;
        dsaPct = 5;
        projPct = 0;
        intPct = 5;
    }

    return {
        proximityDays,
        readinessFactor: readiness.overallReadiness,
        allocation: {
            GATE: gatePct,
            DSA: dsaPct,
            PROJECTS: projPct,
            INTERVIEWS: intPct
        }
    };
};

export const unifyCareerVectors = async (userId: string, year: string) => {
    // Mocks existing dependency tree checking both Career and GATE vectors securely
    const timeMatrix = await calculateTimeAllocation(userId, year);

    return {
        identity: 'UNIFIED_CAREERNOVA',
        timeMatrix,
        recommendationInjection: {
            alertLevel: timeMatrix.allocation.GATE > 70 ? 'HIGH_PRIORITY_EXAM' : 'BALANCED_STABLE',
            pathwaySuppression: timeMatrix.allocation.PROJECTS === 0 ? ['AVOID_LARGE_PROJECTS'] : []
        }
    }
};
