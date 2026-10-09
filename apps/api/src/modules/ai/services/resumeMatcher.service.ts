import { logger } from '@/utils/logger';

export type RequirementType = 'REQUIRED' | 'PREFERRED';
export type RequirementLogic = 'SINGLE' | 'OR_GROUP' | 'AND_GROUP';
export type EvidenceLevel = 'EXPLICIT' | 'PARTIAL' | 'INFERRED' | 'NOT_FOUND';
export type MatchStatus = 'SATISFIED' | 'PARTIAL' | 'NOT_SATISFIED' | 'UNCLEAR';

export interface Requirement {
  canonicalSkill: string;
  category: string;
  requirementType: RequirementType;
  logic: RequirementLogic;
  alternatives?: string[]; // for OR_GROUP or AND_GROUP
}

export interface MatchResult {
  canonicalSkill: string;
  requirementType: RequirementType;
  matchStatus: MatchStatus;
  evidenceLevel: EvidenceLevel;
  evidenceSection: string | null;
  evidenceText: string | null;
  matchedAlternative?: string;
}

export interface DeterministicResult {
  matchScore: number;
  categoryScores: {
    requiredSkills: number;
    preferredSkills: number;
    experience: number;
    projects: number;
    education: number;
    atsReadiness: number;
  };
  skillsYouHave: string[];
  missingRequiredSkills: string[];
  partialMatches: string[];
  missingPreferredSkills: string[];
  resumeIssues: string[];
  top5Changes: string[];
  improvedBulletSuggestions: any[];
  isDeterministicOnly: boolean;
  matchDetails: MatchResult[];
}

const ALIAS_MAP: Record<string, string> = {
  'oop': 'OOP',
  'object-oriented programming': 'OOP',
  'object oriented programming': 'OOP',
  'object-oriented design': 'OOP',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  'restful api': 'REST APIs',
  'restful apis': 'REST APIs',
  'api development': 'REST APIs',
  'spring': 'Spring Boot',
  'spring boot': 'Spring Boot',
  'springboot': 'Spring Boot',
  'react': 'React.js',
  'react.js': 'React.js',
  'reactjs': 'React.js',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'sql': 'SQL',
  'sql databases': 'SQL',
  'sql database': 'SQL',
  'relational database sql': 'SQL',
  'git': 'Git',
  'github': 'GitHub',
  'version control': 'Version Control',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'c++': 'C++',
  'cpp': 'C++',
  'c/c++': 'C++',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mysql': 'MySQL',
  'my sql': 'MySQL',
  'dsa': 'DSA',
  'data structures and algorithms': 'DSA',
  'data structures & algorithms': 'DSA',
  'microservices': 'Microservices',
  'micro services': 'Microservices',
  'java': 'Java',
  'python': 'Python',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'ci/cd': 'CI/CD',
  'devops': 'DevOps',
  'azure': 'Azure',
  'gcp': 'GCP',
  'generative ai': 'Generative AI',
  'ai-assisted development': 'AI-assisted development',
  'machine learning': 'AI/ML',
  'ai/ml': 'AI/ML',
  'open-source contribution': 'Open-source contribution'
};

const normalizeSkill = (skill: string): string => {
  const lower = skill.toLowerCase().trim();
  return ALIAS_MAP[lower] || skill.trim();
};

export const parseJobDescription = (jdText: string): Requirement[] => {
  const reqs: Requirement[] = [];
  const text = jdText.toLowerCase();

  // Basic separation logic. In a real highly-robust engine this uses NLP, 
  // but we can parse the specific Infosys JD formatting safely.
  const isPreferredSection = (index: number) => {
    const prefIdx = text.indexOf('preferred');
    const addIdx = text.indexOf('additional');
    const barrier = Math.max(prefIdx !== -1 ? prefIdx : 0, addIdx !== -1 ? addIdx : 0);
    return barrier > 0 && index > barrier;
  };

  const lines = jdText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentContext: RequirementType = 'REQUIRED';
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (lowerLine.includes('preferred') || lowerLine.includes('additional') || lowerLine.includes('nice to have')) {
      currentContext = 'PREFERRED';
      continue;
    }
    if (lowerLine.includes('required') || lowerLine.includes('core') || lowerLine.includes('must have')) {
      currentContext = 'REQUIRED';
      continue;
    }

    // Ignore all-caps headers completely
    if (line === line.toUpperCase() && line.length > 3 && !/^[-•*]/.test(line)) continue;

    // Ignore standard JD metadata and descriptive headers
    if (/^(company|role|location|experience|employment type|salary|industry|job description|about us|overview|key responsibilities|candidate profile|assessment areas|project experience)/i.test(line)) continue;

    // Skip section headers if they end with colon
    if (line.endsWith(':') && line.length < 30) continue;

    // Detect OR groups (e.g. "At least one programming language such as Java, Python, C++, or JavaScript/TypeScript")
    if (lowerLine.includes('such as') || lowerLine.includes('one of') || lowerLine.includes('or')) {
      const parts = line.split(/such as|one of/i);
      const listStr = (parts.length > 1 ? parts[1] : parts[0]) || '';
      // extract actual skills
      const rawAlternatives = listStr.split(/,|\/|\bor\b/i)
        .map(s => s.trim().replace(/\.$/, ''))
        .filter(s => s.length > 0 && s.length < 25);
      
      if (rawAlternatives.length > 1) {
        reqs.push({
          canonicalSkill: `OR_GROUP_${rawAlternatives[0]}`,
          category: 'Group',
          requirementType: currentContext,
          logic: 'OR_GROUP',
          alternatives: rawAlternatives.map(normalizeSkill)
        });
        continue;
      }
    }

    // Protect known phrases with "and" before splitting
    let processedLine = line;
    if (lowerLine.includes('data structures and algorithms')) {
       processedLine = processedLine.replace(/data structures and algorithms/i, 'DSA');
    }

    // Detect AND groups (e.g. "Java and SQL and Git")
    if (processedLine.toLowerCase().includes(' and ')) {
      const rawAlternatives = processedLine.split(/\band\b/i)
        .map(s => s.trim().replace(/^[-•*]\s*/, '').replace(/\.$/, ''))
        .filter(s => s.length > 0 && s.length < 30);
      
      if (rawAlternatives.length > 1) {
        for (const alt of rawAlternatives) {
          if (alt.split(' ').length > 4) continue;
          if (/^(design|develop|build|create|apply|work|follow|contribute|solve|collaborate|learn|maintain|ensure|manage|lead|support|participate|understand|write|use|experience|ability|knowledge|understanding|excellent|strong|good|proven)\b/i.test(alt)) continue;
          
          reqs.push({
            canonicalSkill: normalizeSkill(alt),
            category: 'Skill',
            requirementType: currentContext,
            logic: 'SINGLE'
          });
        }
        continue;
      }
    }

    // Split basic comma or slash separated lists (e.g. "Docker, AWS, Kubernetes" or "Git / Version Control")
    const cleanLine = line.replace(/^[-•*]\s*/, '').replace(/\.$/, '');
    if (cleanLine.includes(',') || cleanLine.includes('/')) {
      const parts = cleanLine.split(/,|\//).map(s => s.trim()).filter(s => s.length > 1 && s.length < 50);
      if (parts.length > 1) {
        for (const p of parts) {
          if (p.split(' ').length > 4) continue;
          if (/^(design|develop|build|create|apply|work|follow|contribute|solve|collaborate|learn|maintain|ensure|manage|lead|support|participate|understand|write|use|experience|ability|knowledge|understanding|excellent|strong|good|proven)\b/i.test(p)) continue;

          reqs.push({
            canonicalSkill: normalizeSkill(p),
            category: 'Skill',
            requirementType: currentContext,
            logic: 'SINGLE'
          });
        }
        continue;
      }
    }

    // Single skill (e.g. "- React")
    if (cleanLine.length < 50 && cleanLine.length > 1) {
      // If it has too many words or starts with a common verb, it's likely a responsibility, not a technical skill.
      if (cleanLine.split(' ').length > 4) continue;
      if (/^(design|develop|build|create|apply|work|follow|contribute|solve|collaborate|learn|maintain|ensure|manage|lead|support|participate|understand|write|use|experience|ability|knowledge|understanding|excellent|strong|good|proven)\b/i.test(cleanLine)) continue;
      
      reqs.push({
        canonicalSkill: normalizeSkill(cleanLine),
        category: 'Skill',
        requirementType: currentContext,
        logic: 'SINGLE'
      });
    }
  }

  // Deduplicate: If a skill is both REQUIRED and PREFERRED, keep only REQUIRED.
  const uniqueReqs: Requirement[] = [];
  for (const r of reqs) {
    const existing = uniqueReqs.findIndex(ur => 
      ur.canonicalSkill.toLowerCase() === r.canonicalSkill.toLowerCase() || 
      (r.logic === 'SINGLE' && ur.logic === 'OR_GROUP' && ur.alternatives?.includes(r.canonicalSkill))
    );
    if (existing !== -1) {
      const existingReq = uniqueReqs[existing];
      if (existingReq && r.requirementType === 'REQUIRED' && existingReq.requirementType === 'PREFERRED') {
        existingReq.requirementType = 'REQUIRED';
      }
    } else {
      uniqueReqs.push(r);
    }
  }

  return uniqueReqs;
};

export const extractResumeSections = (resumeText: string) => {
  const sections = {
    TECHNICAL_SKILLS: '',
    COURSEWORK: '',
    EXPERIENCE: '',
    INTERNSHIP: '',
    PROJECTS: '',
    CERTIFICATIONS: '',
    ACHIEVEMENTS: '',
    EDUCATION: '',
    SUMMARY: '',
    OTHER: ''
  };

  let currentSection = 'OTHER';
  const lines = resumeText.split('\n');

  for (const line of lines) {
    const upperLine = line.toUpperCase();
    if (upperLine.includes('SKILL') && !upperLine.includes('COMMUNICATION')) currentSection = 'TECHNICAL_SKILLS';
    else if (upperLine.includes('COURSEWORK') || upperLine.includes('SUBJECTS')) currentSection = 'COURSEWORK';
    else if (upperLine.includes('INTERN')) currentSection = 'INTERNSHIP';
    else if (upperLine.includes('EXPERIENCE') || upperLine.includes('EMPLOYMENT') || upperLine.includes('WORK')) currentSection = 'EXPERIENCE';
    else if (upperLine.includes('PROJECT')) currentSection = 'PROJECTS';
    else if (upperLine.includes('CERTIFICAT')) currentSection = 'CERTIFICATIONS';
    else if (upperLine.includes('ACHIEVEMENT') || upperLine.includes('AWARD')) currentSection = 'ACHIEVEMENTS';
    else if (upperLine.includes('EDUCATION') || upperLine.includes('UNIVERSITY') || upperLine.includes('DEGREE')) currentSection = 'EDUCATION';
    else if (upperLine.includes('SUMMARY') || upperLine.includes('OBJECTIVE') || upperLine.includes('PROFILE')) currentSection = 'SUMMARY';

    sections[currentSection as keyof typeof sections] += line + '\n';
  }

  return sections;
};

export const runDeterministicMatch = (resumeText: string, jobDescription: string): DeterministicResult => {
  const requirements = parseJobDescription(jobDescription);
  const sections = extractResumeSections(resumeText);
  const lowerSections = Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, v.toLowerCase()]));

  const matchDetails: MatchResult[] = [];
  const skillsYouHave: string[] = [];
  const missingRequiredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  const partialMatches: string[] = [];

  let requiredTotal = 0;
  let requiredSatisfied = 0;
  let preferredTotal = 0;
  let preferredSatisfied = 0;

  const findEvidence = (skillToFind: string): { level: EvidenceLevel, section: string | null, text: string | null } => {
    const lowerSkill = skillToFind.toLowerCase();
    
    // Reverse check ALIAS_MAP to find all aliases to search for
    const aliasesToSearch = [lowerSkill];
    for (const [alias, canonical] of Object.entries(ALIAS_MAP)) {
      if (canonical.toLowerCase() === lowerSkill) {
        aliasesToSearch.push(alias);
      }
    }

    for (const [section, content] of Object.entries(lowerSections)) {
      for (const searchTerm of aliasesToSearch) {
        if (content.includes(searchTerm)) {
          // Found explicit evidence
          return { level: 'EXPLICIT', section, text: searchTerm };
        }
      }
    }
    return { level: 'NOT_FOUND', section: null, text: null };
  };

  for (const req of requirements) {
    if (req.logic === 'SINGLE') {
      const evidence = findEvidence(req.canonicalSkill);
      const isSatisfied = evidence.level === 'EXPLICIT' || evidence.level === 'PARTIAL';
      
      matchDetails.push({
        canonicalSkill: req.canonicalSkill,
        requirementType: req.requirementType,
        matchStatus: isSatisfied ? 'SATISFIED' : 'NOT_SATISFIED',
        evidenceLevel: evidence.level,
        evidenceSection: evidence.section,
        evidenceText: evidence.text
      });

      if (req.requirementType === 'REQUIRED') {
        requiredTotal++;
        if (isSatisfied) {
          requiredSatisfied++;
          skillsYouHave.push(`${req.canonicalSkill} (Evidence: Found in ${evidence.section})`);
        } else {
          missingRequiredSkills.push(req.canonicalSkill);
        }
      } else {
        preferredTotal++;
        if (isSatisfied) {
          preferredSatisfied++;
          skillsYouHave.push(`${req.canonicalSkill} (Evidence: Found in ${evidence.section})`);
        } else {
          missingPreferredSkills.push(req.canonicalSkill);
        }
      }
    } else if (req.logic === 'OR_GROUP' && req.alternatives) {
      let groupSatisfied = false;
      let matchedAlt = '';
      let bestEvidence: any = { level: 'NOT_FOUND', section: null, text: null };

      for (const alt of req.alternatives) {
        const evidence = findEvidence(alt);
        if (evidence.level === 'EXPLICIT' || evidence.level === 'PARTIAL') {
          groupSatisfied = true;
          matchedAlt = alt;
          bestEvidence = evidence;
          break; // Satisfied the OR group
        }
      }

      matchDetails.push({
        canonicalSkill: req.alternatives.join(' OR '),
        requirementType: req.requirementType,
        matchStatus: groupSatisfied ? 'SATISFIED' : 'NOT_SATISFIED',
        evidenceLevel: bestEvidence.level,
        evidenceSection: bestEvidence.section,
        evidenceText: bestEvidence.text,
        matchedAlternative: matchedAlt
      });

      if (req.requirementType === 'REQUIRED') {
        requiredTotal++;
        if (groupSatisfied) {
          requiredSatisfied++;
          skillsYouHave.push(`${matchedAlt} (Satisfies: ${req.alternatives.join('/')})`);
        } else {
          missingRequiredSkills.push(`One of: ${req.alternatives.join(', ')}`);
        }
      } else {
        preferredTotal++;
        if (groupSatisfied) {
          preferredSatisfied++;
          skillsYouHave.push(`${matchedAlt} (Satisfies: ${req.alternatives.join('/')})`);
        } else {
          missingPreferredSkills.push(`One of: ${req.alternatives.join(', ')}`);
        }
      }
    }
  }

  // Calculate scores securely
  const requiredScore = requiredTotal > 0 ? Math.round((requiredSatisfied / requiredTotal) * 100) : 100;
  const preferredScore = preferredTotal > 0 ? Math.round((preferredSatisfied / preferredTotal) * 100) : 100;
  
  // Experience checks (Freshers handling)
  const isFresherJD = jobDescription.toLowerCase().includes('fresher') || jobDescription.toLowerCase().includes('0 years');
  let experienceScore = 50;
  if (isFresherJD && (sections.INTERNSHIP.length > 50 || sections.PROJECTS.length > 100)) {
    experienceScore = 90; // Fresher with projects/internships gets high exp score
  } else if (sections.EXPERIENCE.length > 200) {
    experienceScore = 80;
  }

  // Education matching
  let eduScore = 50;
  if (sections.EDUCATION.length > 50) {
    if (sections.EDUCATION.toLowerCase().includes('artificial intelligence') || sections.EDUCATION.toLowerCase().includes('computer science') || sections.EDUCATION.toLowerCase().includes('information technology') || sections.EDUCATION.toLowerCase().includes('b.tech')) {
      eduScore = 95;
    } else {
      eduScore = 75;
    }
  }

  const projectScore = sections.PROJECTS.length > 200 ? 85 : 50;
  const atsScore = resumeText.length > 1000 ? 85 : 40;

  // Final deterministic match score heavily weighted on required skills
  const matchScore = Math.round((requiredScore * 0.5) + (preferredScore * 0.2) + (experienceScore * 0.1) + (eduScore * 0.1) + (projectScore * 0.1));

  return {
    matchScore,
    categoryScores: {
      requiredSkills: requiredScore,
      preferredSkills: preferredScore,
      experience: experienceScore,
      projects: projectScore,
      education: eduScore,
      atsReadiness: atsScore
    },
    skillsYouHave,
    missingRequiredSkills,
    partialMatches,
    missingPreferredSkills,
    resumeIssues: [],
    top5Changes: [
      missingRequiredSkills.length > 0 ? `Review the missing required skills (${missingRequiredSkills[0]}) and add them if you possess them.` : "Your required skill alignment is excellent.",
      missingPreferredSkills.length > 0 ? `Consider adding evidence for preferred skills like ${missingPreferredSkills[0]} if you have used them.` : "You hit many preferred qualifications.",
      "Ensure your contact information is clearly visible at the top.",
      "Check that your most recent experience is detailed thoroughly."
    ],
    improvedBulletSuggestions: [],
    isDeterministicOnly: true,
    matchDetails
  };
};
