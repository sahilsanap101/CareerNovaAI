export interface DependencyRule {
  skill: string;
  prerequisites: string[];
}

export const SKILL_DEPENDENCY_GRAPH: DependencyRule[] = [
  // Web Development Tree
  { skill: 'CSS', prerequisites: ['HTML'] },
  { skill: 'JavaScript', prerequisites: ['HTML', 'CSS'] },
  { skill: 'TypeScript', prerequisites: ['JavaScript'] },
  { skill: 'React', prerequisites: ['HTML', 'CSS', 'JavaScript'] },
  { skill: 'Angular', prerequisites: ['TypeScript'] },
  { skill: 'Vue', prerequisites: ['JavaScript'] },
  { skill: 'Node.js', prerequisites: ['JavaScript'] },
  { skill: 'Express', prerequisites: ['Node.js'] },

  // Java Tree
  { skill: 'Java', prerequisites: ['C'] },
  { skill: 'Spring Boot', prerequisites: ['Java'] },

  // Python & AI Tree
  { skill: 'Python', prerequisites: ['C'] },
  { skill: 'Django', prerequisites: ['Python'] },
  { skill: 'Machine Learning', prerequisites: ['Python'] },
  { skill: 'TensorFlow', prerequisites: ['Python', 'Machine Learning'] },
  { skill: 'PyTorch', prerequisites: ['Python', 'Machine Learning'] },

  // Cloud & DevOps Tree
  { skill: 'Linux', prerequisites: ['C'] },
  { skill: 'Networking', prerequisites: ['Linux'] },
  { skill: 'Docker', prerequisites: ['Linux'] },
  { skill: 'Kubernetes', prerequisites: ['Docker', 'Linux'] },
  { skill: 'AWS', prerequisites: ['Networking', 'Linux'] },
  { skill: 'Azure', prerequisites: ['Networking', 'Linux'] },
  { skill: 'GCP', prerequisites: ['Networking', 'Linux'] },

  // Cyber Security Tree
  { skill: 'Wireshark', prerequisites: ['Networking', 'Linux'] },
  { skill: 'Burp Suite', prerequisites: ['Networking', 'HTML'] },
  { skill: 'Metasploit', prerequisites: ['Linux', 'Networking', 'Python'] },
];

/**
 * Returns ordered skill learning order respecting prerequisites.
 */
export function getPrerequisiteChain(targetSkills: string[]): string[] {
  const ordered: string[] = [];
  const visited = new Set<string>();

  function visit(skillName: string) {
    if (visited.has(skillName)) return;
    visited.add(skillName);

    const rule = SKILL_DEPENDENCY_GRAPH.find((r) => r.skill.toLowerCase() === skillName.toLowerCase());
    if (rule) {
      for (const prereq of rule.prerequisites) {
        visit(prereq);
      }
    }
    if (!ordered.includes(skillName)) {
      ordered.push(skillName);
    }
  }

  for (const s of targetSkills) {
    visit(s);
  }

  return ordered;
}
