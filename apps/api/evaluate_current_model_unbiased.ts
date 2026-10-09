import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { CareerKnowledgeService } from './src/modules/careers/services/careerKnowledge.service';
import { RecommendationEngineService } from './src/modules/careers/services/recommendationEngine.service';
import { StudentRecommendationProfile } from './src/modules/careers/types';

async function main() {
    console.log("Initializing CareerKnowledgeService...");
    CareerKnowledgeService.initialize(path.join(__dirname, '../../research/data'));

    console.log("Loading dataset...");
    const csvPath = path.join(__dirname, '../../research/data/evaluation/student_dataset_500_development.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvData, { columns: true, skip_empty_lines: true });

    let top1Hits = 0;
    let top3Hits = 0;
    let top5Hits = 0;
    let mrrSum = 0;
    let totalEvaluated = 0;

    for (const record of records) {
        const studentId = record['student_id'];
        const year = parseInt(record['year']) || 1;
        const cgpa = parseFloat(record['cgpa']) || 0;
        const targetCareer = record['career_preference']?.trim().toLowerCase();
        if (!targetCareer) continue;

        const profile: StudentRecommendationProfile = {
            studentId,
            yearStage: {
                year,
                semester: parseInt(record['semester']) || 1,
                isExploratory: year <= 2,
                isPlacementReady: year >= 3
            },
            academic: {
                degree: 'B.Tech',
                branch: record['branch'] || null,
                specialization: null,
                cgpa
            },
            skills: {},
            interests: {},
            projects: [],
            certifications: [],
            codingEvidence: {
                totalProblemsSolved: 0,
                activePlatforms: []
            },
            careerGoals: {
                targetRole: null,
                targetIndustry: null,
                preferredCountries: null,
                preferredWorkMode: null,
                aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false }
            }
        };

        // Add skills (iterating over keys in record)
        const interestKeys = ['interest_ai_ml', 'interest_data', 'interest_web', 'interest_software', 'interest_cloud', 'interest_cybersecurity'];
        const fixedKeys = ['student_id', 'year', 'branch', 'semester', 'cgpa', 'projects_count', 'certifications_count', 'internship_experience', 'career_preference'];
        
        for (const [key, value] of Object.entries(record)) {
            if (fixedKeys.includes(key)) continue;
            if (interestKeys.includes(key)) {
                if (parseInt(value as string) === 1) {
                    profile.interests[key] = { priority: 1 };
                }
                continue;
            }
            
            const prof = parseInt(value as string) || 0;
            if (prof > 0) {
                profile.skills[key] = {
                    proficiency: prof,
                    confidence: 100
                };
            }
        }

        const recs = await RecommendationEngineService.generateRecommendations(profile);
        
        let rank = -1;
        for (let i = 0; i < recs.length; i++) {
            if (recs[i].careerName.toLowerCase() === targetCareer) {
                rank = i + 1;
                break;
            }
        }

        if (rank === 1) top1Hits++;
        if (rank > 0 && rank <= 3) top3Hits++;
        if (rank > 0 && rank <= 5) top5Hits++;
        if (rank > 0) mrrSum += (1 / rank);
        totalEvaluated++;
    }

    const top1 = (top1Hits / totalEvaluated) * 100;
    const top3 = (top3Hits / totalEvaluated) * 100;
    const top5 = (top5Hits / totalEvaluated) * 100;
    const mrr = (mrrSum / totalEvaluated) * 100;

    console.log(JSON.stringify({
        totalEvaluated,
        top1,
        top3,
        top5,
        mrr
    }, null, 2));
}

main().catch(console.error);
