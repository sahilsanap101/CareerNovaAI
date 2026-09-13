import { PrismaClient, GateExamLifecycle } from '@prisma/client';

const prisma = new PrismaClient();

// Internal helper for logging audits explicitly mapping the admin tokens
const logAdminAction = async (adminId: string, action: string, entityId: string, details: any = null) => {
    await prisma.gateAdminAudit.create({
        data: {
            adminId,
            action,
            entityId,
            details: details ? details : undefined
        }
    });
};

/**
 * Sweeps a specific Exam Year for constraints.
 * 1. Missing explicit syllabus associations
 * 2. Papers that are completely empty
 */
export const validateExamGraph = async (year: number) => {
    const exam = await (prisma as any).gateExam.findFirst({
        where: { year },
        include: {
            papers: {
                include: {
                    subjects: {
                        include: {
                            topics: {
                                include: {
                                    questions: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!exam) throw new Error("Exam Year not found");

    const issues: string[] = [];

    // Validates paper empty spaces
    if (exam.papers.length === 0) issues.push("Exam has no Papers configured.");

    for (const paper of exam.papers) {
        if (paper.subjects.length === 0) {
            issues.push(`Paper [${paper.paperCode}] has no Subjects mapped.`);
        }
    }

    return issues;
};

/**
 * Core lifecycle publisher. Blocks execution if validation issues persist.
 */
export const transitionExamLifecycle = async (year: number, nextStage: GateExamLifecycle, adminId: string) => {
    // 1. Fetch current
    const exam = await (prisma as any).gateExam.findFirst({ where: { year } });
    if (!exam) throw new Error("Exam not found");

    // 2. Bound constraints preventing random jumps
    if (nextStage === 'PUBLISHED') {
        const issues = await validateExamGraph(year);
        if (issues.length > 0) {
            throw new Error(`Cannot Publish year ${year}. Validation failures exist: ` + issues.join(' | '));
        }
    }

    // 3. Persist update
    const updated = await (prisma as any).gateExam.update({
        where: { id: exam.id },
        data: {
            lifecycleStatus: nextStage
        }
    });

    // 4. Trace to Admin Audit Logs
    await logAdminAction(adminId, `TRANSITION_LIFECYCLE_${nextStage}`, updated.id, { from: exam.lifecycleStatus, to: nextStage });

    return updated;
};

export const verifyResource = async (resourceId: string, adminId: string, isOfficial: boolean) => {
    const r = await prisma.gateResource.findUnique({ where: { id: resourceId } });
    if (!r) throw new Error("Resource not found");

    // Persist Verification bounds mapping internal audit records 
    const updated = await prisma.gateResource.update({
        where: { id: resourceId },
        data: {
            isOfficial,
            verifiedAt: new Date(),
            lastVerifiedAt: new Date()
        }
    });

    await logAdminAction(adminId, `VERIFY_RESOURCE`, resourceId, { isOfficial });
    return updated;
};
