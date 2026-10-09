import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { RecommendationEngineService } from '../modules/careers/services/recommendationEngine.service';
import { CareerKnowledgeService } from '../modules/careers/services/careerKnowledge.service';
import { StudentRecommendationProfile } from '../modules/careers/types';

async function runEvaluation() {
    CareerKnowledgeService.initialize();
    
    // Check 15 benchmark careers
    const dataDir = path.resolve(process.cwd(), '../../research/data');
    const careerSkillCsvPath = path.join(dataDir, 'career_skill_dataset_15_careers.csv');
    const rawCareerSkills = parse(fs.readFileSync(careerSkillCsvPath, 'utf8'), { columns: true, skip_empty_lines: true });

    const validCareerNames = new Set<string>();
    rawCareerSkills.forEach((row: any) => {
        validCareerNames.add(row.career_name);
    });

    // Extract valid careers from engine
    const allCareers = CareerKnowledgeService.getCareersForRecommendation();
    const benchmarkCareers = allCareers.filter((c: any) => validCareerNames.has(c.name));
    
    if (benchmarkCareers.length !== 15) {
        throw new Error(`Expected 15 benchmark careers, got ${benchmarkCareers.length}`);
    }

    const validCareerIds = new Set(benchmarkCareers.map((c: any) => c.id));

    // Load dataset
    const devDatasetPath = path.join(dataDir, 'student_dataset_500_development.csv');
    const rawStudents = parse(fs.readFileSync(devDatasetPath, 'utf8'), { columns: true, skip_empty_lines: true });

    if (rawStudents.length !== 500) {
        throw new Error(`Expected 500 profiles, got ${rawStudents.length}`);
    }

    // Map CSV column names to Canonical Names
    const allSkills = CareerKnowledgeService.getAllSkills();
    const exactColumnToCanonical: Record<string, string> = {};
    for (const skill of allSkills) {
        const name = skill.canonicalName || skill.name;
        // Standard transformation as seen in columns
        let colName = name.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/\./g, '')
            .replace(/\//g, '_');
        
        // Handle specific edge cases in dataset
        if (name === 'C++') colName = 'c++';
        if (name === 'Node.js') colName = 'nodejs';
        if (name === 'React') colName = 'react';
        if (name === 'HTML/CSS') colName = 'html_css';

        exactColumnToCanonical[colName] = name;
    }
    
    let totalProfiles = 0;
    let top1Hits = 0;
    let top3Hits = 0;
    let top5Hits = 0;
    let mrrSum = 0;
    let ndcg5Sum = 0;
    
    // Confusion matrix for macro metrics
    const classStats: Record<string, { tp: number, fp: number, fn: number }> = {};
    for (const cName of validCareerNames) {
        classStats[cName] = { tp: 0, fp: 0, fn: 0 };
    }
    
    const classCounts: Record<string, number> = {};

    for (const row of rawStudents as any[]) {
        const groundTruthCareer = row.career_preference;
        classCounts[groundTruthCareer] = (classCounts[groundTruthCareer] || 0) + 1;
        
        const profile: StudentRecommendationProfile = {
            studentId: row.student_id,
            yearStage: {
                year: parseInt(row.year),
                semester: parseInt(row.semester),
                isExploratory: parseInt(row.year) <= 2,
                isPlacementReady: parseInt(row.year) > 2
            },
            academic: {
                degree: 'B.Tech',
                branch: row.branch,
                specialization: null,
                cgpa: parseFloat(row.cgpa)
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
                targetRole: null, // LEAKAGE PREVENTION
                targetIndustry: null,
                preferredCountries: null,
                preferredWorkMode: null,
                aspirations: { higherStudies: false, entrepreneurship: false, governmentJobs: false, startup: false, research: false }
            }
        };

        const skillColsStart = 'api_testing';
        const skillColsEnd = 'ui_ux';
        let inSkillsRow = false;
        const validSkillsAdded: string[] = [];
        
        for (const [key, val] of Object.entries(row as any)) {
            if (key === skillColsStart) inSkillsRow = true;
            
            if (inSkillsRow) {
                const canonical = exactColumnToCanonical[key];
                if (canonical) {
                    const prof = parseInt(val as string, 10);
                    if (prof > 0) {
                        profile.skills[canonical] = {
                            proficiency: prof,
                            confidence: 100
                        };
                        validSkillsAdded.push(canonical);
                    }
                }
            }
            
            if (key === skillColsEnd) inSkillsRow = false;
        }

        // Interests
        if (parseInt(row.interest_ai_ml)) profile.interests['ai_ml'] = { priority: 1 };
        if (parseInt(row.interest_data)) profile.interests['data'] = { priority: 1 };
        if (parseInt(row.interest_web)) profile.interests['web'] = { priority: 1 };
        if (parseInt(row.interest_software)) profile.interests['software'] = { priority: 1 };
        if (parseInt(row.interest_cloud)) profile.interests['cloud'] = { priority: 1 };
        if (parseInt(row.interest_cybersecurity)) profile.interests['cybersecurity'] = { priority: 1 };

        const projCount = parseInt(row.projects_count) || 0;
        for (let i=0; i<projCount; i++) {
            profile.projects.push({ title: `Project ${i}`, description: '', technologies: [] }); 
        }
        
        const certCount = parseInt(row.certifications_count) || 0;
        for (let i=0; i<certCount; i++) {
            profile.certifications.push({ title: `Cert ${i}`, issuer: 'Issuer' });
        }

        const recommendations = await RecommendationEngineService.generateRecommendations(profile);
        
        // Filter to 15 careers and sort
        const validRecs = recommendations.filter(r => validCareerIds.has(r.careerId));
        validRecs.sort((a, b) => b.finalScore - a.finalScore);
        validRecs.forEach((r, idx) => { r.rank = idx + 1; });

        const top1 = validRecs[0];
        const targetRank = validRecs.findIndex(r => r.careerName === groundTruthCareer) + 1; 
        
        if (targetRank === 1) top1Hits++;
        if (targetRank > 0 && targetRank <= 3) top3Hits++;
        if (targetRank > 0 && targetRank <= 5) top5Hits++;
        
        if (targetRank > 0) {
            mrrSum += 1.0 / targetRank;
        }
        
        if (targetRank > 0 && targetRank <= 5) {
            ndcg5Sum += 1.0 / Math.log2(targetRank + 1);
        }
        
        const predictedClass = top1?.careerName || "Unknown";
        if (predictedClass === groundTruthCareer) {
            if (classStats[groundTruthCareer]) classStats[groundTruthCareer].tp++;
        } else {
            if (classStats[predictedClass]) classStats[predictedClass].fp++;
            if (classStats[groundTruthCareer]) classStats[groundTruthCareer].fn++;
        }
        
        totalProfiles++;
    }

    // Macro Metrics
    let macroPrecisionSum = 0;
    let macroRecallSum = 0;
    let macroF1Sum = 0;
    let numClasses = 0;

    for (const [cName, stats] of Object.entries(classStats)) {
        numClasses++;
        const precision = stats.tp + stats.fp > 0 ? stats.tp / (stats.tp + stats.fp) : 0;
        const recall = stats.tp + stats.fn > 0 ? stats.tp / (stats.tp + stats.fn) : 0;
        const f1 = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
        
        macroPrecisionSum += precision;
        macroRecallSum += recall;
        macroF1Sum += f1;
    }

    const t1 = (top1Hits / totalProfiles) * 100;
    const t3 = (top3Hits / totalProfiles) * 100;
    const t5 = (top5Hits / totalProfiles) * 100;
    const mrr = (mrrSum / totalProfiles) * 100;
    const ndcg5 = (ndcg5Sum / totalProfiles) * 100;
    
    const macroP = (macroPrecisionSum / numClasses) * 100;
    const macroR = (macroRecallSum / numClasses) * 100;
    const macroF1 = (macroF1Sum / numClasses) * 100;

    let maxCount = 0;
    for (const count of Object.values(classCounts)) {
        if (count > maxCount) maxCount = count;
    }

    console.log(JSON.stringify({
        totalProfiles,
        largestClassBaseline: (maxCount / totalProfiles) * 100,
        randomBaseline: (1 / 15) * 100,
        metrics: {
            Top1: t1,
            Top3: t3,
            Top5: t5,
            MRR: mrr,
            NDCG5: ndcg5,
            MacroPrecision: macroP,
            MacroRecall: macroR,
            MacroF1: macroF1
        }
    }, null, 2));
}

runEvaluation().catch(console.error);
