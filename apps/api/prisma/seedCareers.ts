import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Career Knowledge Base Seeding...');

  const csvPath = path.resolve(__dirname, '../../../research/data/career_skill_dataset_15_careers.csv');
  console.log(`Loading dataset from: ${csvPath}`);
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Dataset not found at ${csvPath}`);
  }

  const csvData = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvData.split('\n').filter(line => line.trim().length > 0);
  
  // Skip header
  const dataLines = lines.slice(1);

  console.log(`Found ${dataLines.length} skill requirement entries.`);

  const careerMap = new Map<string, string>(); // careerId -> name
  const canonicalSkillsMap = new Map<string, { name: string; aliases: string[] }>();

  // Helper to normalize skill names to canonical forms
  const normalizeSkillName = (rawName: string) => {
    const trimmed = rawName.trim();
    const lower = trimmed.toLowerCase();
    if (lower === 'node' || lower === 'nodejs' || lower === 'node.js') return 'Node.js';
    if (lower === 'html' || lower === 'css' || lower === 'html/css') return 'HTML/CSS';
    if (lower === 'js' || lower === 'javascript') return 'JavaScript';
    if (lower === 'ts' || lower === 'typescript') return 'TypeScript';
    if (lower === 'aws' || lower === 'amazon web services') return 'AWS';
    if (lower === 'gcp' || lower === 'google cloud') return 'GCP';
    if (lower === 'dsa' || lower === 'data structures and algorithms' || lower === 'algorithms') return 'DSA';
    if (lower === 'ml' || lower === 'machine learning') return 'Machine Learning';
    if (lower === 'nlp' || lower === 'natural language processing') return 'NLP';
    
    // Default
    return trimmed;
  };

  // 1. First Pass: Collect distinct careers and canonicalize skills
  const parsedRows: any[] = [];
  
  for (const line of dataLines) {
    // CSV Format: career_id,career_name,skill,importance,minimum_proficiency
    const [career_id, career_name, skill, importance, minimum_proficiency] = line.split(',');
    
    if (!career_id || !career_name || !skill) continue;

    careerMap.set(career_id, career_name.trim());

    const canonicalName = normalizeSkillName(skill);
    
    if (!canonicalSkillsMap.has(canonicalName)) {
      canonicalSkillsMap.set(canonicalName, {
        name: canonicalName,
        aliases: [skill.trim()],
      });
    } else {
      const existing = canonicalSkillsMap.get(canonicalName)!;
      if (!existing.aliases.includes(skill.trim()) && skill.trim() !== canonicalName) {
        existing.aliases.push(skill.trim());
      }
    }
    
    parsedRows.push({
      career_id,
      career_name: career_name.trim(),
      canonical_skill: canonicalName,
      importance: (importance || 'IMPORTANT').trim().toUpperCase(),
      minimum_proficiency: parseInt((minimum_proficiency || '1').trim(), 10) || 1
    });
  }

  console.log(`Identified ${careerMap.size} distinct careers and ${canonicalSkillsMap.size} canonical skills.`);

  // 2. Seed Skills
  const dbSkills = new Map<string, string>(); // canonicalName -> dbId
  for (const [canonicalName, data] of canonicalSkillsMap.entries()) {
    const dbSkill = await prisma.skill.upsert({
      where: { name: canonicalName },
      update: {
        canonicalName: canonicalName,
        aliases: data.aliases
      },
      create: {
        name: canonicalName,
        canonicalName: canonicalName,
        aliases: data.aliases,
        category: 'General', // We default to General since CSV doesn't specify category
      }
    });
    dbSkills.set(canonicalName, dbSkill.id);
  }

  // 3. Seed Careers & Requirements
  let requirementsCreated = 0;
  
  for (const [career_id, career_name] of careerMap.entries()) {
    const dbCareer = await prisma.careerPath.upsert({
      where: { name: career_name },
      update: {
        category: 'Software', // Default domain
      },
      create: {
        name: career_name,
        description: `${career_name} career path.`,
        category: 'Software',
        industry: 'Technology',
        averageSalary: 'Pending',
        growthRate: 'Pending',
        demandLevel: 'HIGH',
      }
    });

    const careerRows = parsedRows.filter(r => r.career_id === career_id);
    
    for (const row of careerRows) {
      const skillId = dbSkills.get(row.canonical_skill)!;
      
      const skillType = row.importance === 'CORE' ? 'CORE' : (row.importance === 'IMPORTANT' ? 'IMPORTANT' : 'OPTIONAL');
      const weight = skillType === 'CORE' ? 10 : (skillType === 'IMPORTANT' ? 7 : 4);
      
      await prisma.requiredSkill.upsert({
        where: {
          careerPathId_skillId: {
            careerPathId: dbCareer.id,
            skillId: skillId,
          }
        },
        update: {
          importanceWeight: weight,
          minimumProficiency: row.minimum_proficiency,
          recommendedProficiency: Math.min(5, row.minimum_proficiency + 1),
          skillType: skillType,
        },
        create: {
          careerPathId: dbCareer.id,
          skillId: skillId,
          importanceWeight: weight,
          minimumProficiency: row.minimum_proficiency,
          recommendedProficiency: Math.min(5, row.minimum_proficiency + 1),
          skillType: skillType,
        }
      });
      requirementsCreated++;
    }
  }

  console.log(`✅ Seeded ${careerMap.size} Careers`);
  console.log(`✅ Seeded ${canonicalSkillsMap.size} Canonical Skills`);
  console.log(`✅ Seeded ${requirementsCreated} Career-Skill Relationships`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
