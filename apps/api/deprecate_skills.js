const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

async function main() {
  const csvPath = path.resolve(__dirname, '../../research/data/skill_catalog_pathforge_2026.csv');
  const csvData = parse(fs.readFileSync(csvPath, 'utf8'), { columns: true, skip_empty_lines: true });
  
  const validSkillNames = new Set(csvData.map(s => s.skill.toLowerCase()));

  const allSkills = await prisma.skill.findMany();
  let deprecatedCount = 0;

  for (const dbSkill of allSkills) {
    if (!validSkillNames.has(dbSkill.name.toLowerCase())) {
       await prisma.skill.update({
         where: { id: dbSkill.id },
         data: { category: 'Deprecated' }
       });
       deprecatedCount++;
    }
  }

  console.log(`Deprecated ${deprecatedCount} old skills.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
