import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { RecommendationEngineService } from '../modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from '../modules/careers/types';

async function run() {
  const baseDir = path.resolve(__dirname, '../../../../');
  const conditions = ['A', 'B', 'C'];
  const subsetPath = path.join(baseDir, 'research/data/synthetic_v3/synthetic_v3_career_subset_v1.json');
  const subset = JSON.parse(fs.readFileSync(subsetPath, 'utf-8'));
  const subsetNames = subset.map((c: any) => c.career_name);
  
  const ablations = [
    { name: 'None', weights: {} },
    { name: 'Skills', weights: { SKILLS: 0.0 } },
    { name: 'Interests', weights: { INTERESTS: 0.0 } },
    { name: 'Projects', weights: { PROJECTS: 0.0 } },
    { name: 'Academics', weights: { ACADEMIC: 0.0 } },
    { name: 'Certifications', weights: { CERTIFICATIONS: 0.0 } },
    { name: 'Coding', weights: { CODING: 0.0 } },
    { name: 'Goals', weights: { GOALS: 0.0 } }
  ];
  
  const allResults = [];
  
  for (const c of conditions) {
    console.log(`Processing condition ${c}...`);
    const csvPath = path.join(baseDir, `research/data/synthetic_v3/synthetic_v3_${c}_split.csv`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, { columns: true, skip_empty_lines: true }).filter((r: any) => r.split === 'TEST');
    
    for (const rec of records as any[]) {
      const profile: StudentRecommendationProfile = JSON.parse(rec.profile_json);
      const studentId = rec.student_id;
      const target = rec.career_suitability;
      
      for (const abl of ablations) {
         const pResults = await RecommendationEngineService.generateRecommendations(profile, abl.weights);
         
         const subsetResults = pResults.filter(r => subsetNames.includes(r.careerName));
         // Tie breaking
         subsetResults.sort((a, b) => {
            if (a.finalScore !== b.finalScore) return b.finalScore - a.finalScore;
            return a.careerName.localeCompare(b.careerName);
         });
         
         const targetRank = subsetResults.findIndex(r => r.careerName === target) + 1;
         const rr = targetRank > 0 ? 1.0 / targetRank : 0.0;
         const ndcg5 = (targetRank > 0 && targetRank <= 5) ? (1.0 / Math.log2(targetRank + 1)) : 0.0;
         const top1 = targetRank === 1 ? 1 : 0;
         
         allResults.push({
           condition: c,
           student_id: studentId,
           ablated_dimension: abl.name,
           top1,
           rr,
           ndcg5
         });
      }
    }
  }
  
  // Aggregate
  const aggregated: Record<string, any> = {};
  for (const r of allResults) {
     const key = `${r.condition}_${r.ablated_dimension}`;
     if (!aggregated[key]) aggregated[key] = { condition: r.condition, ablated_dimension: r.ablated_dimension, top1: 0, rr: 0, ndcg5: 0, count: 0 };
     aggregated[key].top1 += r.top1;
     aggregated[key].rr += r.rr;
     aggregated[key].ndcg5 += r.ndcg5;
     aggregated[key].count += 1;
  }
  
  const finalOut = Object.values(aggregated).map(a => {
     return `${a.condition},${a.ablated_dimension},${a.top1/a.count},${a.rr/a.count},${a.ndcg5/a.count}`;
  });
  
  const header = "condition,ablated_dimension,top1,mrr,ndcg5\n";
  fs.writeFileSync(path.join(baseDir, 'research/results/pathforge_profile_weight_sensitivity_v3.csv'), header + finalOut.join('\n'));
  console.log("Ablation dumped.");
}

run().catch(console.error);
