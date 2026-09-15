import { PrismaClient } from '@prisma/client';
import { generateRecommendations } from '../apps/api/src/modules/recommendations/services/recommendation.service';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        include: { profile: true }
    });

    if (!user) {
        console.log("No user found.");
        return;
    }

    console.log(`Testing with user ${user.id}...`);
    try {
        const result = await generateRecommendations(user.id);
        require('fs').writeFileSync('../../research/success.txt', JSON.stringify(result, null, 2));
        console.log("Success! Rendered to success.txt");
    } catch (e: any) {
        require('fs').writeFileSync('../../research/error_log.txt', String(e.stack || e.message || e));
        console.error("----- ERROR DUMPED TO FILE -----");
    }
}

main().finally(() => prisma.$disconnect());
