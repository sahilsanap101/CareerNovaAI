const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.feedback.count();
    console.log(`count`);
    console.log(`-------`);
    console.log(`     ${count}`);
    console.log(`(1 row)`);

    if (count > 0) {
        console.log(`\nFound test rows, deleting...`);
        await prisma.feedback.deleteMany();
        const newCount = await prisma.feedback.count();
        console.log(`count after delete: ${newCount}`);
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
