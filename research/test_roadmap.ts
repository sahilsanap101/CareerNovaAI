import { buildAdaptiveRoadmapTree } from '../apps/api/src/modules/roadmap/engine/adaptiveRoadmapEngine';

// Force inject the mock for getPrerequisiteChain since we are just testing the resolution block
const mockDependencies = (skills: string[]) => {
    if (skills.includes('JavaScript')) return ['HTML', 'CSS', 'JavaScript'];
    if (skills.includes('Bash')) return ['Bash'];
    if (skills.includes('JS')) return ['JavaScript'];
    if (skills.includes('javascript')) return ['JavaScript'];
    return skills;
};

// Instead of rewriting the engine entirely for this script, we'll verify its output structurally.
(function runTests() {
    console.log("Running Curation Resolution Tests...");

    try {
        let passed = 0;

        // 1. Known skill (JavaScript)
        const mapJS = buildAdaptiveRoadmapTree('Frontend', ['JavaScript'], []);
        const jsMod = mapJS[0].modules.find(m => m.providedSkills.includes('JavaScript'));
        const jsRes = jsMod?.tasks[0].resources as any[];
        if (jsRes && jsRes !== 'resource_curation_pending' && jsRes[0].title.includes('MDN')) {
            console.log("✅ 1. Known skill returns resource");
            passed++;
        } else {
            console.log("❌ 1. Known skill returns resource (Failed)");
        }

        // 2. Lowercase (javascript)
        const mapLower = buildAdaptiveRoadmapTree('Frontend', ['javascript'], []);
        const lowMod = mapLower[0].modules.find(m => m.providedSkills.includes('JavaScript') || m.providedSkills.includes('javascript'));
        const lowRes = lowMod?.tasks[0].resources;
        if (lowRes && lowRes !== 'resource_curation_pending') {
            console.log("✅ 2. Lowercase skill resolves");
            passed++;
        } else {
            console.log("❌ 2. Lowercase skill resolves (Failed)");
        }

        // 3. Aliases (JS)
        const mapAlias = buildAdaptiveRoadmapTree('Frontend', ['JS'], []);
        const aliasMod = mapAlias[0].modules.find(m => m.providedSkills.includes('JavaScript') || m.providedSkills.includes('JS'));
        const aliasRes = aliasMod?.tasks[0].resources;
        if (aliasRes && aliasRes !== 'resource_curation_pending') {
            console.log("✅ 3. Aliases resolve");
            passed++;
        } else {
            console.log("❌ 3. Aliases resolve (Failed)");
        }

        // 4. Unknown skill
        const mapUnknown = buildAdaptiveRoadmapTree('DevOps', ['Bash'], []);
        const unknownMod = mapUnknown[0].modules.find(m => m.providedSkills.includes('Bash'));
        const unknownRes = unknownMod?.tasks[0].resources;
        if (unknownRes === 'resource_curation_pending') {
            console.log("✅ 4. Unknown skill returns 'resource_curation_pending'");
            passed++;
        } else {
            console.log("❌ 4. Unknown skill returns 'resource_curation_pending' (Failed)");
        }

        // 5. Dummy URL check
        const strMap = JSON.stringify(mapJS).toLowerCase();
        if (!strMap.includes('youtube.com/results') && !strMap.includes('search_query')) {
            console.log("✅ 5. No dummy URL is generated");
            passed++;
        } else {
            console.log("❌ 5. No dummy URL is generated (Failed)");
        }

        // 6. JSON / Phase validation
        if (mapJS.length > 0 && mapJS[0].phaseNumber === 1 && mapJS[0].modules.length > 0) {
            console.log("✅ 6. Roadmap JSON morphology is valid");
            passed++;
        } else {
            console.log("❌ 6. Roadmap JSON morphology is valid (Failed)");
        }

        console.log(`\nTEST RESULTS: ${passed}/6 PASSED.`);

    } catch (e) {
        console.error("Test execution failed:", e);
    }
})();
