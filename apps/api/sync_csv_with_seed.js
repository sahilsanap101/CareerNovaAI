const fs = require('fs');
const path = require('path');

const seedFile = fs.readFileSync(path.join(__dirname, 'prisma/seed.ts'), 'utf8');

// Extremely simple extraction of CAREER_PATHS_DATA from seed.ts
const startIndex = seedFile.indexOf('const CAREER_PATHS_DATA = [');
const endIndex = seedFile.indexOf('];', startIndex) + 2;

let careerDataRaw = seedFile.substring(startIndex, endIndex);
careerDataRaw = careerDataRaw.replace('const CAREER_PATHS_DATA = ', 'module.exports = ');

fs.writeFileSync(path.join(__dirname, 'temp_careers.js'), careerDataRaw);
const careers = require('./temp_careers.js');

const skillSet = new Set();
const careersOutput = [];
const skillsOutput = [];
const careerSkillsOutput = [];

const escapeCsv = (str) => {
    if (!str) return '';
    const stringified = String(str);
    if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
};

// headers
careersOutput.push('career_id,career_name,domain,subdomain,placement_mode,on_campus_relevance,off_campus_relevance,entry_level_relevance,recommended_start_year,placement_focus_year,core_skills,important_skills,all_required_skills,core_skill_count,important_skill_count,total_skill_count,source_summary');
skillsOutput.push('skill_id,skill,skill_category,aliases,careers_count,proficiency_scale');
careerSkillsOutput.push('career_id,career_name,domain,subdomain,placement_mode,on_campus_relevance,off_campus_relevance,entry_level_relevance,recommended_start_year,placement_focus_year,skill,skill_category,importance,importance_weight,minimum_proficiency,recommended_proficiency,skill_rank_in_career,evidence_level,evidence_sources,evidence_note,assessment_rule');

const allSkillsMap = {};

careers.forEach((c, index) => {
    const careerId = `C${(index + 1).toString().padStart(2, '0')}`;
    const domain = c.category || 'General';
    const name = c.name;
    const allSkills = c.skills.map(s => s.name).join('; ');
    
    // We treat top half as core, bottom half as important
    const coreCount = Math.ceil(c.skills.length / 2);
    const coreSkills = c.skills.slice(0, coreCount).map(s => s.name).join('; ');
    const impSkills = c.skills.slice(coreCount).map(s => s.name).join('; ');

    careersOutput.push([
        careerId, name, domain, domain, 'Campus + Off-campus', 'Yes', 'Yes', 'Common graduate-entry', 1, 3,
        coreSkills, impSkills, allSkills, coreCount, c.skills.length - coreCount, c.skills.length, 'Generated from seed.ts'
    ].map(escapeCsv).join(','));

    c.skills.forEach((s, sIndex) => {
        const skillName = s.name;
        if (!allSkillsMap[skillName]) {
            allSkillsMap[skillName] = {
                id: `SK_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
                name: skillName,
                category: c.category,
                count: 0
            };
        }
        allSkillsMap[skillName].count += 1;
        const skillObj = allSkillsMap[skillName];
        
        const importance = sIndex < coreCount ? 'Core' : 'Important';
        const weight = s.weight || (10 - sIndex);
        
        careerSkillsOutput.push([
            careerId, name, domain, domain, 'Campus + Off-campus', 'Yes', 'Yes', 'Common graduate-entry', 1, 3,
            skillName, skillObj.category, importance, weight, 1, 3, sIndex + 1, 'C', 'Seed data mapping', 'Generated mapping', 'Count as met when student proficiency >= 3; below this is a gap.'
        ].map(escapeCsv).join(','));
    });
});

Object.values(allSkillsMap).forEach(s => {
    skillsOutput.push([
        s.id, s.name, s.category, '', s.count, '0=None, 1=Beginner, 2=Basic, 3=Intermediate, 4=Advanced, 5=Expert'
    ].map(escapeCsv).join(','));
});

const dataDir = path.resolve(__dirname, '../../research/data');
fs.writeFileSync(path.join(dataDir, 'career_catalog_pathforge_60_careers_2026.csv'), careersOutput.join('\n'));
fs.writeFileSync(path.join(dataDir, 'skill_catalog_pathforge_2026.csv'), skillsOutput.join('\n'));
fs.writeFileSync(path.join(dataDir, 'career_skill_dataset_15_careers.csv'), careerSkillsOutput.join('\n'));

console.log('CSVs generated successfully!');
