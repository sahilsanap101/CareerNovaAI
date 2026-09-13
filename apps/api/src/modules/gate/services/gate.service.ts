import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getActiveExams = async () => {
    return await prisma.gateExam.findMany({
        where: { isActive: true },
        orderBy: { year: 'desc' }
    });
};

export const getPapersByYear = async (year: number) => {
    const exam = await prisma.gateExam.findUnique({
        where: { year }
    });

    if (!exam) {
        throw new Error(`No official exam found for year ${year}. Information is not yet verified or published. Please refer to official IIT/IISc sites.`);
    }

    return await prisma.gatePaper.findMany({
        where: { examId: exam.id },
        orderBy: { paperCode: 'asc' }
    });
};

export const getDetailedPaper = async (year: number, paperCode: string) => {
    const exam = await prisma.gateExam.findUnique({
        where: { year }
    });

    if (!exam) return null;

    return await prisma.gatePaper.findUnique({
        where: {
            examId_paperCode: {
                examId: exam.id,
                paperCode: paperCode.toUpperCase()
            }
        },
        include: {
            subjects: {
                include: {
                    topics: {
                        include: {
                            resources: true
                        }
                    }
                }
            },
            resources: {
                where: { topicId: null }
            }
        }
    });
};

export const seedDevelopmentFixture = async () => {
    // Check if 2024 already exists
    const existing = await prisma.gateExam.findUnique({ where: { year: 2024 } });
    if (existing) return existing;

    const exam = await prisma.gateExam.create({
        data: {
            year: 2024,
            organizingInstitute: 'IISc Bangalore',
            officialWebsite: 'https://gate2024.iisc.ac.in',
            isActive: true,
            papers: {
                create: {
                    paperCode: 'CS',
                    paperName: 'Computer Science & Information Technology',
                    session: 'Forenoon',
                    subjects: {
                        create: [
                            {
                                title: 'Data Structures and Algorithms',
                                weightagePercent: 15,
                                topics: {
                                    create: [
                                        { title: 'Programming in C', description: 'Recursion, Arrays.' },
                                        { title: 'Graphs and Trees', description: 'Traversals, MST.' }
                                    ]
                                }
                            },
                            {
                                title: 'Operating Systems',
                                weightagePercent: 10,
                                topics: {
                                    create: [
                                        { title: 'Concurrency', description: 'Semaphores, Deadlocks.' }
                                    ]
                                }
                            }
                        ]
                    },
                    resources: {
                        create: [
                            {
                                title: 'Official GATE 2024 CS Question Paper',
                                url: 'https://gate2024.iisc.ac.in/papers',
                                provider: 'IISc Official',
                                resourceType: 'PYQ',
                                isOfficial: true,
                                verifiedAt: new Date()
                            }
                        ]
                    }
                }
            }
        }
    });

    return exam;
};
