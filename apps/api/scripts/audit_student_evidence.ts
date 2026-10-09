import fs from 'fs';
import path from 'path';
import { StudentEvidenceEngine } from '../src/research_core/evidence/student_evidence_engine';

async function runStudentEvidenceAudit() {
  console.log('Running Student Evidence Engine Audit...');
  const engine = new StudentEvidenceEngine();

  // Create a synthetic full profile
  const syntheticProfile = {
    id: 'user_audit_1',
    profile: {
      degree: 'B.Tech',
      branch: 'Computer Science',
      currentYear: 3,
      cgpa: 8.5
    },
    skills: [
      { skill: { name: 'React' }, proficiency: 4, experienceMonths: 12, confidence: 90 },
      { skill: { name: 'Node.js' }, proficiency: 3, experienceMonths: 6, confidence: 75 }
    ],
    careerGoal: {
      preferredJobRole: 'Full Stack Developer',
      preferredIndustry: 'Tech'
    },
    projects: [
      { title: 'E-commerce Platform', technologies: 'React, Node, MongoDB', completionStatus: 'COMPLETED' }
    ],
    certifications: [
      { title: 'AWS Solutions Architect', issuer: 'Amazon' }
    ]
  };

  const readiness = engine.evaluateReadiness(syntheticProfile);
  const evidence = engine.compileEvidence(syntheticProfile);

  const auditsDir = path.join(process.cwd(), '..', '..', 'research', 'audits');
  
  if (!fs.existsSync(auditsDir)) {
    fs.mkdirSync(auditsDir, { recursive: true });
  }

  const mdPath = path.join(auditsDir, 'student_evidence_engine_report.md');
  const mdContent = `# Student Evidence Engine Audit

## Architecture Overview
The \`StudentEvidenceEngine\` sits between the raw Prisma database models and the core CareerNova recommendation algorithms. It ensures strict mapping of student inputs into partitioned evidence blocks:
- **Primary Competencies**: Verified skills with proficiency.
- **Supporting Evidence**: Projects and certifications (kept separate from primary scores).
- **Preferences**: Career goals and interests.
- **Context**: Academic standing.

## Readiness Evaluation
Given a synthetic complete profile:
- **Status**: \`${readiness.status}\`
- **Missing Sections**: ${readiness.missingSections.length === 0 ? 'None' : readiness.missingSections.join(', ')}

## Compiled Evidence Payload
This is the exact JSON structure the recommendation engine will consume:
\`\`\`json
${JSON.stringify(evidence, null, 2)}
\`\`\`

> Note: Notice that the "E-commerce Platform" project is strictly stored under \`supportingEvidence.projects\` and NOT automatically converted into an arbitrary skill.
`;

  fs.writeFileSync(mdPath, mdContent);
  console.log('Student Evidence Audit generated successfully.');
}

void runStudentEvidenceAudit();
