import { runHumanEvaluation } from '../../../../research/evaluation/human_eval/run_human_eval';
import * as fs from 'fs';
import * as path from 'path';

describe('Phase 4.2 Human Evaluation Pipeline', () => {
  const RESULTS_DIR = path.join(__dirname, '../../../../research/final_results');

  it('runs the NO-GROUND-TRUTH mode properly', async () => {
    await runHumanEvaluation();

    expect(fs.existsSync(path.join(RESULTS_DIR, 'phase4_2_summary.json'))).toBe(true);
    expect(fs.existsSync(path.join(RESULTS_DIR, 'human_eval_metrics.csv'))).toBe(true);
    expect(fs.existsSync(path.join(RESULTS_DIR, 'human_eval_data_quality.csv'))).toBe(true);
    
    const summary = JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, 'phase4_2_summary.json'), 'utf-8'));
    expect(summary.status).toBe('HUMAN GROUND TRUTH NOT YET SUPPLIED');
    expect(summary.metrics).toBe('NOT GENERATED');
  });
});
