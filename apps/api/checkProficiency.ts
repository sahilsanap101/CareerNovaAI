const { prisma } = require('./src/config/database');
async function run() {
  const user = await prisma.user.findFirst({ where: { fullName: 'Sahil Sanap' }, include: { skills: { include: { skill: true } } } });
  console.log(user.skills.map(s => s.skill.name + ': ' + s.proficiency).join('\n'));
}
run().catch(console.error).finally(() => process.exit(0));
