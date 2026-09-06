import * as fs from 'fs';
import { buildAdaptiveRoadmapTree } from '../src/modules/roadmap/engine/adaptiveRoadmapEngine';

const CAREER_SKILLS = [
    { id: 's1', name: 'React' },
    { id: 's2', name: 'TypeScript' },
    { id: 's3', name: 'CSS' },
    { id: 's4', name: 'Node.js' },
    { id: 's5', name: 'PostgreSQL' }
];

function evaluateRoadmap() {
    const NUM_RUNS = 50;
    console.log(`Generating ${NUM_RUNS} synthetic roadmaps...`);

    let validRoadmaps = 0;
    let totalViolations = 0;

    const startTime = Date.now();

    for (let i = 0; i < NUM_RUNS; i++) {
        const userSkills = CAREER_SKILLS.slice(0, Math.floor(Math.random() * 3) + 1).map(s => ({
            skill: s,
            proficiency: Math.floor(Math.random() * 5) + 1,
            experienceMonths: 0,
            confidence: 100
        }));

        const reqSkills = CAREER_SKILLS.map(s => ({
            skill: s,
            importanceWeight: 10
        }));

        // The system throws if we pass missing parameters, let's mock it correctly
        try {
            const paceOptions = ['FAST', 'MEDIUM', 'SLOW'] as const;
            const pace = paceOptions[Math.floor(Math.random() * 3)];

            const roadmap = buildAdaptiveRoadmapTree(reqSkills, userSkills, pace);

            // Validation Check 1: Did it prune skills with proficiency >= 4?
            let hasViolation = false;
            let violationsInThisRun = 0;

            roadmap.phases.forEach(phase => {
                phase.modules.forEach(mod => {
                    // Find if this module correlates to a high-prof skill
                    const skillMatch = userSkills.find(us => us.skill.name === mod.title);
                    if (skillMatch && skillMatch.proficiency >= 4) {
                        hasViolation = true;
                        violationsInThisRun++;
                    }
                });
            });

            if (!hasViolation) {
                validRoadmaps++;
            }
            totalViolations += violationsInThisRun;

        } catch (e) {
            console.error("Failed to generate roadmap", e);
        }
    }

    const duration = Date.now() - startTime;

    const metrics = {
        experiment: 'Roadmap Structural Validation',
        datasetSize: NUM_RUNS,
        metrics: {
            roadmapConsistencyRate: validRoadmaps / NUM_RUNS,
            totalViolationsFound: totalViolations,
            avgLatencyMs: duration / NUM_RUNS
        }
    };

    fs.writeFileSync('roadmap_results.json', JSON.stringify(metrics, null, 2));
    console.log('Roadmap Validation Done:', metrics);
}

evaluateRoadmap();
