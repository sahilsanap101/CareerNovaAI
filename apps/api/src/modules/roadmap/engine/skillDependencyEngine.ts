import { normalizeSkillName } from '@pathforge/shared-constants';
import * as fs from 'fs';
import * as path from 'path';

export interface DependencyRule {
  skill: string;
  prerequisites: { skill: string; source: string }[];
}

let SKILL_DEPENDENCY_GRAPH: DependencyRule[] = [];

try {
  const possiblePaths = [
    path.join(__dirname, '../../../../../../research/data/dependency_graph.json'), // from src
    path.join(process.cwd(), 'research/data/dependency_graph.json'), // if run from workspace root
    path.join(process.cwd(), '../../research/data/dependency_graph.json'), // if run from apps/api
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      SKILL_DEPENDENCY_GRAPH = JSON.parse(fs.readFileSync(p, 'utf-8'));
      break;
    }
  }
} catch (error) {
  console.warn('Failed to load dynamic skill dependency graph, using empty fallback.', error);
}

/**
 * Returns ordered skill learning order respecting prerequisites.
 */
export function getPrerequisiteChain(targetSkills: string[]): string[] {
  const ordered: string[] = [];
  const visited = new Set<string>();

  function visit(skillName: string) {
    if (visited.has(skillName)) return;
    visited.add(skillName);

    const normTarget = normalizeSkillName(skillName);
    const rule = SKILL_DEPENDENCY_GRAPH.find((r) => normalizeSkillName(r.skill) === normTarget);
    if (rule) {
      for (const prereq of rule.prerequisites) {
        visit(prereq.skill);
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
