const { prisma } = require('./src/config/database');
async function run() {
  const career = await prisma.careerPath.findFirst({
    where: { name: 'Full Stack Developer' },
    include: { skillRequirements: { include: { canonicalSkill: { include: { skill: true } } } } }
  });
  console.log('Requirements: ' + career.skillRequirements.map(req => req.canonicalSkill.skill.name).join(', '));
}
run().catch(console.error).finally(() => process.exit(0));
