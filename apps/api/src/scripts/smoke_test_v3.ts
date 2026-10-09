import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { RecommendationEngineService } from '../modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../modules/careers/types';

async function run() {
  const baseDir = path.resolve(__dirname, '../../../../');
  const conditions = ['A', 'B', 'C'];
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const c of conditions) {
    const csvPath = path.join(baseDir, `research/data/synthetic_v3/synthetic_v3_${c}.csv`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true });
    
    // Smoke test only 20 records
    const smokeRecords = records.slice(0, 20);
    
    for (const rec of smokeRecords as any) {
      try {
        const profile: StudentRecommendationProfile = JSON.parse(rec.profile_json);
        // Quick type validation based on TS interface (structural check)
        if (!profile.yearStage || profile.yearStage.year === undefined) throw new Error("Missing yearStage");
        if (!profile.skills) throw new Error("Missing skills");
        if (!profile.careerGoals) throw new Error("Missing careerGoals");
        
        // Pass through engine
        const results = await RecommendationEngineService.generateRecommendations(profile);
        
        if (results.length > 0 && results[0]?.finalScore !== undefined) {
          validCount++;
        } else {
          invalidCount++;
        }
      } catch (err) {
        console.error("Schema or processing error:", err);
        invalidCount++;
      }
    }
  }
  
  const report = [
    { metric: "total_smoke_tested", value: 60 },
    { metric: "valid_ingested", value: validCount },
    { metric: "schema_errors", value: invalidCount },
    { metric: "status", value: invalidCount === 0 ? "PASS" : "FAIL" }
  ];
  
  const header = "metric,value\n";
  const body = report.map(r => `${r.metric},${r.value}`).join('\n');
  fs.writeFileSync(path.join(baseDir, 'research/results/synthetic_v3_schema_validation.csv'), header + body);
  console.log("Smoke test complete.");
}

run().catch(console.error);
