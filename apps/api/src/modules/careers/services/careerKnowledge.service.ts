import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export class CareerKnowledgeService {
  private static careers: any[] = [];
  private static careerMap: Map<string, any> = new Map();
  private static resources: any[] = [];
  private static graphDependencies: any[] = [];
  private static initialized = false;

  public static initialize(dataDir?: string) {
    if (this.initialized) return;

    let baseDir = dataDir;
    if (!baseDir) {
       if (fs.existsSync(path.resolve(process.cwd(), 'research/data'))) {
          baseDir = path.resolve(process.cwd(), 'research/data');
       } else if (fs.existsSync(path.resolve(process.cwd(), '../../research/data'))) {
          baseDir = path.resolve(process.cwd(), '../../research/data');
       } else if (fs.existsSync(path.resolve(__dirname, '../../../../../../research/data'))) {
          baseDir = path.resolve(__dirname, '../../../../../../research/data');
       } else {
          throw new Error("Could not find research/data directory for CSV knowledge base.");
       }
    }
    
    console.log(`[CareerKnowledgeService] Loading CSV knowledge base from: ${baseDir}`);

    // 1. Load Skill Catalog
    const skillCsvPath = path.join(baseDir, 'skill_catalog_pathforge_2026.csv');
    if (!fs.existsSync(skillCsvPath)) throw new Error(`Missing skill catalog: ${skillCsvPath}`);
    const rawSkills = parse(fs.readFileSync(skillCsvPath, 'utf8'), { columns: true, skip_empty_lines: true });
    
    const skillDict: Record<string, any> = {};
    rawSkills.forEach((s: any) => {
       if (!s.skill_id || !s.skill) throw new Error(`Invalid skill record: ${JSON.stringify(s)}`);
       skillDict[s.skill] = {
         id: s.skill_id,
         name: s.skill,
         canonicalName: s.skill, // Ensure consistent casing if needed, but original uses name directly.
         category: s.skill_category
       };
       skillDict[s.skill_id] = skillDict[s.skill];
    });

    // 2. Load Career Catalog
    const careerCsvPath = path.join(baseDir, 'career_catalog_pathforge_60_careers_2026.csv');
    if (!fs.existsSync(careerCsvPath)) throw new Error(`Missing career catalog: ${careerCsvPath}`);
    const rawCareers = parse(fs.readFileSync(careerCsvPath, 'utf8'), { columns: true, skip_empty_lines: true });

    // 3. Load Career Skills
    const careerSkillsCsvPath = path.join(baseDir, 'career_skill_dataset_15_careers.csv');
    if (!fs.existsSync(careerSkillsCsvPath)) throw new Error(`Missing career skills: ${careerSkillsCsvPath}`);
    const rawCareerSkills = parse(fs.readFileSync(careerSkillsCsvPath, 'utf8'), { columns: true, skip_empty_lines: true });

    const careersMap = new Map<string, any>();
    
    rawCareers.forEach((c: any) => {
       if (!c.career_id || !c.career_name) throw new Error(`Invalid career record: ${JSON.stringify(c)}`);
       if (careersMap.has(c.career_id)) throw new Error(`Duplicate career ID: ${c.career_id}`);
       careersMap.set(c.career_id, {
         id: c.career_id,
         name: c.career_name,
         category: c.domain,
         interests: [], // Required by recommendation engine type
         requiredSkills: []
       });
    });

    rawCareerSkills.forEach((cs: any) => {
       const career = careersMap.get(cs.career_id);
       if (!career) throw new Error(`Career skill references unknown career_id: ${cs.career_id}`);
       
       let skillType = 'IMPORTANT';
       if (cs.importance && cs.importance.toLowerCase() === 'core') skillType = 'CORE';
       else if (cs.importance && cs.importance.toLowerCase() === 'optional') skillType = 'OPTIONAL';
       
       let resolvedSkill = skillDict[cs.skill];
       if (!resolvedSkill) {
         // Fallback if skill isn't in catalog (but ideally it should be)
         resolvedSkill = {
           id: cs.skill,
           name: cs.skill,
           canonicalName: cs.skill,
           category: cs.skill_category || 'General'
         };
       }

       career.requiredSkills.push({
         skillId: resolvedSkill.id,
         skillName: resolvedSkill.name,
         skillType,
         minimumProficiency: parseInt(cs.minimum_proficiency, 10) || 1,
         recommendedProficiency: parseInt(cs.recommended_proficiency, 10) || 3,
         importanceWeight: parseInt(cs.importance_weight, 10) || 5,
         skill: resolvedSkill
       });
    });

    this.careers = Array.from(careersMap.values());
    this.careerMap = careersMap;

    // 4. Load Resources
    const resourceCsvPath = path.join(baseDir, 'learning_resource_catalog.csv');
    const validResources: any[] = [];
    if (fs.existsSync(resourceCsvPath)) {
       const rawResources = parse(fs.readFileSync(resourceCsvPath, 'utf8'), { columns: true, skip_empty_lines: true });
       rawResources.forEach((r: any) => {
          if (!r.skill_id) {
             console.warn(`[CareerKnowledgeService] Resource references unknown skill: ${JSON.stringify(r)}`);
          } else if (!skillDict[r.skill_id]) {
             console.warn(`[CareerKnowledgeService] Resource references undefined skill_id (skipping): ${r.skill_id}`);
          } else {
             validResources.push(r);
          }
       });
       this.resources = validResources;
    }

    // 5. Load Prerequisites
    const prereqCsvPath = path.join(baseDir, 'skill_prerequisite_graph.csv');
    const validPrereqs: any[] = [];
    if (fs.existsSync(prereqCsvPath)) {
       const rawPrereqs = parse(fs.readFileSync(prereqCsvPath, 'utf8'), { columns: true, skip_empty_lines: true });
       rawPrereqs.forEach((p: any) => {
          if (!skillDict[p.skill_id]) {
             console.warn(`[CareerKnowledgeService] Prerequisite references unknown skill_id (skipping): ${p.skill_id}`);
          } else if (!skillDict[p.prerequisite_skill_id]) {
             console.warn(`[CareerKnowledgeService] Prerequisite references unknown prerequisite_skill_id (skipping): ${p.prerequisite_skill_id}`);
          } else {
             validPrereqs.push({
                skillId: p.skill_id,
                prerequisiteSkillId: p.prerequisite_skill_id,
                dependencyType: p.dependency_type
             });
          }
       });
       this.graphDependencies = validPrereqs;
    }

    this.initialized = true;
    console.log(`[CareerKnowledgeService] Successfully loaded ${this.careers.length} careers, ${Object.keys(skillDict).length} skills, ${this.resources.length} resources, ${this.graphDependencies.length} prerequisites.`);
  }

  public static getCareersForRecommendation() {
    this.initialize();
    return this.careers;
  }
  
  public static getResources() {
    this.initialize();
    return this.resources;
  }
  
  public static getSkillDependencies() {
    this.initialize();
    return this.graphDependencies;
  }
  
  public static getCareerById(id: string) {
    this.initialize();
    return this.careerMap.get(id);
  }

  public static getAllSkills() {
    this.initialize();
    // Reconstruct skills array from the careers' required skills to avoid duplicate structures,
    // or just load them once. Since we didn't store allSkills explicitly, let's just parse the skill dict again or build it from careers.
    const allSkillsMap = new Map<string, any>();
    this.careers.forEach(c => {
       c.requiredSkills.forEach((rs: any) => {
          if (!allSkillsMap.has(rs.skillId)) {
             allSkillsMap.set(rs.skillId, rs.skill);
          }
       });
    });
    return Array.from(allSkillsMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }
}
