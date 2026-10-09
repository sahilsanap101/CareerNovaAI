import fs from 'fs';
import path from 'path';
import { RecommendationEngineService } from '../src/modules/careers/services/recommendationEngine.service';
import { CareerKnowledgeService } from '../src/modules/careers/services/careerKnowledge.service';
import { StudentRecommendationProfile } from '../src/modules/careers/types';

async function main() {
    const csvPath = path.join(process.cwd(), '..', '..', 'research', 'data', 'student_dataset_500_development.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0].split(',').map(h => h.trim());
    
    CareerKnowledgeService.getCareersForRecommendation(); // Load DB
    
    let total = 0;
    let top1 = 0, top3 = 0, top5 = 0;
    let mrrSum = 0;
    let ndcg5Sum = 0;
    
    for(let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(h => h.trim());
        if(row.length < headers.length) continue;

        const student: StudentRecommendationProfile = {
            studentId: row[0],
            yearStage: { year: parseInt(row[1]) || 1, semester: parseInt(row[3]) || 1, isExploratory: false, isPlacementReady: true },
            academic: { degree: 'B.Tech', branch: row[2], specialization: null, cgpa: parseFloat(row[4]) || 7.0 },
            skills: {}, interests: {}, projects: [], certifications: [],
            codingEvidence: { totalProblemsSolved: 0, activePlatforms: [] },
            careerGoals: { targetRole: null, targetIndustry: null, preferredCountries: null, preferredWorkMode: null, aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false } }
        };

        for(let j = 8; j < headers.length - 7; j++) {
            const val = parseInt(row[j]) || 0;
            if (val > 0) student.skills[headers[j]] = { proficiency: val, confidence: 100 };
        }
        
        const targetCareer = row[headers.length - 1].toLowerCase();
        
        const recs = await RecommendationEngineService.generateRecommendations(student);
        let rank = -1;
        for (let r = 0; r < recs.length; r++) {
            if (recs[r].careerName.toLowerCase() === targetCareer) {
                rank = r + 1;
                break;
            }
        }
        
        if (rank === 1) top1++;
        if (rank > 0 && rank <= 3) top3++;
        if (rank > 0 && rank <= 5) top5++;
        if (rank > 0) mrrSum += 1 / rank;
        if (rank > 0 && rank <= 5) ndcg5Sum += 1 / Math.log2(rank + 1);
        total++;
    }
    
    console.log(`EVALUATED ${total} STUDENTS`);
    console.log(`Top-1 Hit Rate: ${((top1/total)*100).toFixed(1)}%`);
    console.log(`Top-3 Hit Rate: ${((top3/total)*100).toFixed(1)}%`);
    console.log(`Top-5 Hit Rate: ${((top5/total)*100).toFixed(1)}%`);
    console.log(`MRR: ${((mrrSum/total)*100).toFixed(1)}%`);
    console.log(`NDCG@5: ${((ndcg5Sum/total)*100).toFixed(1)}%`);
}

main().catch(console.error);
