import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkJobs() {
    const jobs = await prisma.job.findMany({
        where: {
            careerMatches: { some: { careerIdentifier: "Full Stack Developer" } }
        },
        include: { careerMatches: true },
        take: 3
    });
    console.dir(jobs, { depth: null });
}

checkJobs();
