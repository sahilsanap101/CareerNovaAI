import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const dataDir = path.resolve(__dirname, '../../../../research/data');
const careerSkillCsvPath = path.join(dataDir, 'career_skill_dataset_15_careers.csv');
const rawCareerSkills = parse(fs.readFileSync(careerSkillCsvPath, 'utf8'), { columns: true, skip_empty_lines: true });

const uniqueCareers = new Set<string>();
rawCareerSkills.forEach((row: any) => {
    uniqueCareers.add(row.career_name);
});

console.log(Array.from(uniqueCareers).sort());
