// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import { PathForgeExperimentRunner } from './experimentRunner';
import { ExperimentConfiguration } from './types';

/**
 * CLI Entry point for batch evaluating research permutations.
 * Usage: ts-node run_experiment.ts <path_to_config_json>
 */

function formatCSV(results: any): string {
    // Unwraps the JSON into a flattened metrics matrix bounded for pandas/R data-frames
    const headers = ['ExperimentID', 'Timestamp', 'CareerScore', 'RoadmapLength', 'Violations', 'DeferredSkills'];
    // Calculate synthetic metrics off test run output 
    // (In real scale, we compute Precision/Recall distributions arrays here).

    const score = results.careerResults?.[0]?.score || 0;
    const len = results.roadmapResults?.length || 0;

    const row = [
        results.experimentId,
        results.timestamp,
        score.toFixed(4),
        len,
        results.metaTracking.prerequisiteViolations,
        results.metaTracking.deferredTargets
    ];

    return `${headers.join(',')}\n${row.join(',')}\n`;
}

async function main() {
    const args = process.argv.slice(2);
    let configPath = args[0];

    if (!configPath) {
        // Default fallback to mock baseline config
        configPath = path.join(process.cwd(), 'research', 'evaluation', 'configs', 'experiment_001.json');
    }

    if (!fs.existsSync(configPath)) {
        console.error(`[Error] Configuration matrix not found at: ${configPath}`);
        process.exit(1);
    }

    const rawConfig = fs.readFileSync(configPath, 'utf8');
    const configObj = JSON.parse(rawConfig);
    const config: ExperimentConfiguration = configObj.experiment;

    const runner = new PathForgeExperimentRunner();

    console.log(`===============================================`);
    console.log(`🚀 RUNNING RESEARCH EVALUATION PROTOCOL`);
    console.log(`===============================================`);
    console.log(`Experiment ID : ${config.experimentId}`);
    console.log(`Protocol      : ${config.evaluationProtocol}`);
    console.log(`Career Model  : ${config.careerModel}`);
    console.log(`Roadmap Model : ${config.roadmapModel}`);
    console.log(`-----------------------------------------------`);

    // Execution (Produces JSON implicitly in runner output)
    await runner.execute(config);

    // Generate CSV dump matrix
    const resultsDir = path.join(process.cwd(), 'research', 'evaluation', 'results');
    // Grabs the most recent implicitly
    const files = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));
    files.sort();
    const latestResult = files[files.length - 1];

    const resJson = JSON.parse(fs.readFileSync(path.join(resultsDir, latestResult), 'utf8'));
    const csvStr = formatCSV(resJson);

    const csvName = latestResult.replace('.json', '.csv');
    fs.writeFileSync(path.join(resultsDir, csvName), csvStr);

    console.log(`[Research Runner] CSV Metrics mapped successfully -> ${csvName}`);
    console.log(`===============================================`);
}

// Execute
if (require.main === module) {
    main().catch(console.error);
}
