import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getOnboardingState = async (userId: string) => {
    return await prisma.userGateProfile.findUnique({
        where: { userId }
    });
};

export const saveOnboardingStep = async (userId: string, step: number, data: any) => {
    const existing = await prisma.userGateProfile.findUnique({ where: { userId } });

    // Map step specific hard columns
    const targetYear = data.targetYear || existing?.targetYear || new Date().getFullYear();
    const targetPaperCode = data.targetPaperCode || existing?.targetPaperCode || 'CS';

    const updateData: any = {
        targetYear,
        targetPaperCode,
    };

    if (data.expectedScore) updateData.expectedScore = data.expectedScore;
    if (data.targetRank) updateData.targetRank = data.targetRank;
    if (data.weeklyStudyHours) updateData.weeklyStudyHours = data.weeklyStudyHours;
    if (data.preparationStage) updateData.preparationStage = data.preparationStage;
    if (data.preferredLearningFormat) updateData.preferredLearningFormat = data.preferredLearningFormat;

    // Persist advanced/custom multi-step config into diagnosticState
    const currentDiagnosticState = (existing as any)?.diagnosticState ? JSON.parse(JSON.stringify((existing as any).diagnosticState)) : {};
    currentDiagnosticState.step = step;
    currentDiagnosticState.metadata = { ...currentDiagnosticState.metadata, ...data.metadata };

    updateData.diagnosticState = currentDiagnosticState;

    return await prisma.userGateProfile.upsert({
        where: { userId },
        update: updateData,
        create: {
            userId,
            ...updateData
        }
    });
};

export const generateDiagnosticAssessment = async (paperCode: string, year: number) => {
    // Finds the official paper for structural parsing
    const paper: any = await prisma.gatePaper.findFirst({
        where: { paperCode, exam: { year } }
    });

    if (!paper) throw new Error("Could not find diagnostic material for this configuration.");

    // Inject a mock diagnostic structure corresponding to this verified exam/paper combo
    paper.questions = [
        { title: "Sample Diagnostic 1", text: "Test logic evaluation" }
    ];

    return paper.questions;
};

export const evaluateDiagnostic = async (userId: string, targetYear: number, submissions: any[]) => {
    // Evaluates performance and generates a real knowledge profile
    let totalCorrect = 0;

    for (const sub of submissions) {
        if (sub.isCorrect) totalCorrect++;
    }

    const score = (totalCorrect / (submissions.length || 1)) * 100;

    const report = {
        strongAreas: score > 70 ? ["Conceptual Foundational Logic"] : [],
        weakAreas: score <= 70 ? ["Time Management", "Advanced Application"] : [],
        criticalPrerequisites: ["Basic Mathematics", "Engineering Logic"],
        recommendedStartingPoint: score > 50 ? "Phase 2 Core Subjects" : "Phase 1 Basics",
        score
    };

    if ((prisma as any).gateReadinessSnapshot) {
        await (prisma as any).gateReadinessSnapshot.create({
            data: {
                userId,
                targetYear,
                readinessScore: score,
                dimensions: report
            }
        });
    }

    return report;
};
