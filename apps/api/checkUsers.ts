const { prisma } = require('./src/config/database');
async function run() {
  const users = await prisma.user.findMany({ include: { skills: { include: { skill: true } } } });
  console.log(users.map(u => u.fullName + ': ' + u.skills.map(s => s.skill.name).join(', ')));
}
run().catch(console.error).finally(() => process.exit(0));
