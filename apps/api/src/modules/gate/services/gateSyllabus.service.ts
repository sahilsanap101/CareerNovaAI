import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSyllabusForPaper = async (paperId: string) => {
    return await prisma.gateSyllabusSubject.findMany({
        where: { paperId },
        include: {
            topics: {
                include: {
                    subtopics: true,
                    prerequisitesGateTarget: true
                }
            }
        }
    });
};
