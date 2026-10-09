import fs from 'fs';
import path from 'path';
import { ResearchDataRepository } from '../src/research_core/data/research_data_repository';
import { SkillResolver } from '../src/research_core/data/skill_resolver';
import { PreferenceFitEngine } from '../src/research_core/evaluation/preference_fit_engine';
import { StudentEvidence } from '../src/research_core/evidence/student_evidence';

async function runPreferenceFitAudit() {
  console.log('Loading ResearchDataRepository for Preference Fit Audit...');
  const repo = ResearchDataRepository.getInstance();
  repo.load();

  const rawSkills = Array.from((repo as any).skills.values());
  const resolver = new SkillResolver(rawSkills, new Map());
  const engine = new PreferenceFitEngine(resolver);

  // We find a career that represents something related to software or AI
  const careers = Array.from((repo as any).careers.values()) as any[];
  
  // Find a career matching "Software" or just use the first placement relevant one
  let targetCareer = careers.find(c => c.careerName.toLowerCase().includes('software developer'));
  if (!targetCareer) {
    targetCareer = careers.find(c => c.placementRelevant && c.requiredSkills.length > 5);
  }

  if (!targetCareer) {
    console.warn('Could not find a valid career for testing.');
    return;
  }

  // Map canonical skill IDs to names for the career
  const requiredSkillNames = targetCareer.requiredSkills.map((id: string) => {
    const skill = rawSkills.find((s: any) => s.canonicalId === id);
    return skill ? skill.normalizedName : '';
  }).filter(Boolean);

  const testCases = [
    {
      name: 'Full Match (Role, Industry, Interest)',
      evidence: {
        userId: 'test1',
        context: {},
        primaryCompetencies: [],
        supportingEvidence: { projects: [], certifications: [], codingProfiles: [] },
        preferences: {
          preferredRoles: [targetCareer.careerName],
          preferredIndustries: [targetCareer.industry || targetCareer.category],
          interests: [{ name: requiredSkillNames[0] || targetCareer.category, priority: 1 }]
        },
        provenance: { generatedAt: new Date().toISOString(), source: 'Audit' }
      }
    },
    {
      name: 'Partial Match (Interest only: AI / Backend)',
      evidence: {
        userId: 'test2',
        context: {},
        primaryCompetencies: [],
        supportingEvidence: { projects: [], certifications: [], codingProfiles: [] },
        preferences: {
          preferredRoles: [],
          preferredIndustries: [],
          interests: [{ name: 'Backend Development', priority: 1 }, { name: 'AI', priority: 1 }]
        },
        provenance: { generatedAt: new Date().toISOString(), source: 'Audit' }
      }
    },
    {
      name: 'Mismatch',
      evidence: {
        userId: 'test3',
        context: {},
        primaryCompetencies: [],
        supportingEvidence: { projects: [], certifications: [], codingProfiles: [] },
        preferences: {
          preferredRoles: ['Actor'],
          preferredIndustries: ['Entertainment'],
          interests: [{ name: 'Acting', priority: 1 }]
        },
        provenance: { generatedAt: new Date().toISOString(), source: 'Audit' }
      }
    },
    {
      name: 'No Preference Evidence',
      evidence: {
        userId: 'test4',
        context: {},
        primaryCompetencies: [],
        supportingEvidence: { projects: [], certifications: [], codingProfiles: [] },
        preferences: { preferredRoles: [], preferredIndustries: [], interests: [] },
        provenance: { generatedAt: new Date().toISOString(), source: 'Audit' }
      }
    }
  ];

  const auditsDir = path.join(process.cwd(), '..', '..', 'research', 'audits');
  if (!fs.existsSync(auditsDir)) {
    fs.mkdirSync(auditsDir, { recursive: true });
  }

  let mdContent = `# Preference Fit Engine Report

## Target Career
- **Career ID**: \`${targetCareer.careerId}\`
- **Career Name**: ${targetCareer.careerName}
- **Industry**: ${targetCareer.industry}
- **Category**: ${targetCareer.category}

## Evaluation Results

| Scenario | Role Score (2.0) | Industry Score (1.5) | Interest Score (1.0) | Total Normalized Fit | Status |
|---|---|---|---|---|---|
`;

  for (const test of testCases) {
    const trace = engine.evaluateFit(test.evidence as StudentEvidence, targetCareer, requiredSkillNames);
    
    mdContent += `| **${test.name}** | ${trace.contributions.roleScore} | ${trace.contributions.industryScore} | ${trace.contributions.interestScore} | \`${trace.preferenceFit !== null ? (trace.preferenceFit * 100).toFixed(2) + '%' : 'N/A'}\` | ${trace.status} |\n`;
    
    // Add sub-rows to show what actually matched if it matched
    if (trace.roleMatches.length > 0) mdContent += `| └ Matched Roles: ${trace.roleMatches.join(', ')} | | | | | |\n`;
    if (trace.industryMatches.length > 0) mdContent += `| └ Matched Industries: ${trace.industryMatches.join(', ')} | | | | | |\n`;
    if (trace.interestMatches.length > 0) mdContent += `| └ Matched Interests: ${trace.interestMatches.join(', ')} | | | | | |\n`;
  }

  mdContent += `\n> Generated by Preference Fit Engine Audit.\n`;

  const mdPath = path.join(auditsDir, 'preference_fit_engine_report.md');
  fs.writeFileSync(mdPath, mdContent);
  console.log('Preference Fit Audit generated successfully.');
}

void runPreferenceFitAudit();
