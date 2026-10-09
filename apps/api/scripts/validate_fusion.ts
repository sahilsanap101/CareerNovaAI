import * as fs from 'fs';
import * as path from 'path';

function validate() {
  const file = fs.readFileSync(path.join(__dirname, '../../../research/fresh_evaluation/06_test_predictions.json'), 'utf-8');
  const preds = JSON.parse(file);
  
  let sample: any = null;
  for (const s of preds) {
      if (Object.values(s.assessment_scores).some((v: any) => v > 0)) {
          sample = s;
          break;
      }
  }
  
  if (!sample) {
      console.log("ALL ASSESSMENT SCORES ARE 0!!!");
      return;
  }
  
  let validCareers = 0;
  const sortedCareers = Object.keys(sample.profile_scores).sort((a, b) => 
      (sample.fusion_scores[b] || 0) - (sample.fusion_scores[a] || 0)
  );
  
  for (const career of sortedCareers) {
      const pScore = sample.profile_scores[career] || 0;
      const aScore = sample.assessment_scores[career] || 0;
      const fScore = sample.fusion_scores[career] || 0;
      
      const pCont = pScore * 0.70;
      const aCont = aScore * 0.30;
      const calcFScore = pCont + aCont;
      
      console.log(`Career: ${career} | Profile: ${pScore.toFixed(4)} | Assessment: ${aScore.toFixed(4)} | Final: ${fScore.toFixed(4)}`);
      validCareers++;
      
      if (validCareers >= 15) break;
  }
}

validate();
