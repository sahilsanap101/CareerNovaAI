import { syncJobsForCareers } from '../modules/jobs/services/jobSync.service';
import { PrismaClient } from '@prisma/client';

async function seedJobs() {
    console.log("Seeding jobs from Jooble...");
    const careers = [
        "Full Stack Developer",
        "Frontend Developer",
        "Backend Developer",
        "Software Engineer"
    ];
    try {
        const result = await syncJobsForCareers(careers, "India");
        console.log("Sync result:", result);
    } catch (e) {
        console.error("Error seeding jobs:", e);
    }
}

seedJobs();
