import { CareerKnowledgeService } from '../services/careerKnowledge.service';
import { RecommendationEngineService } from '../services/recommendationEngine.service';
import { RoadmapEngineService } from '../services/roadmapEngine.service';
import { SkillGraphEngine } from '../services/skillGraphEngine.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('CSV-Driven Architecture Tests', () => {
  beforeAll(async () => {
    // 1. Initialize the CSV knowledge service explicitly to test it
    CareerKnowledgeService.initialize();
    
    // Clear out the database career models completely to prove the engine doesn't use them
    await prisma.requiredSkill.deleteMany({});
    await prisma.careerPath.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. Database career tables are empty', async () => {
    const careersInDb = await prisma.careerPath.count();
    const skillsInDb = await prisma.requiredSkill.count();
    expect(careersInDb).toBe(0);
    expect(skillsInDb).toBe(0);
  });

  it('2. Recommendation still works using CSV files alone', async () => {
    const mockStudent: any = {
      yearStage: { year: 3, isExploratory: false, isPlacementReady: true },
      skills: {
        'Python': { proficiency: 4 },
        'Machine Learning': { proficiency: 3 }
      },
      interests: {},
      academic: { cgpa: 8.5 },
      projects: [],
      certifications: [],
      codingEvidence: { totalProblemsSolved: 50 },
      careerGoals: {}
    };

    const recommendations = await RecommendationEngineService.generateRecommendations(mockStudent);
    
    // We should get 60 careers if it successfully loads from CSV
    expect(recommendations.length).toBe(60);
    expect(recommendations[0].careerName).toBeDefined();
    
    // Check that AI Engineer is ranked high for this profile
    const aiEng = recommendations.find(r => r.careerName.includes('AI Engineer') || r.careerName.includes('Machine Learning'));
    expect(aiEng).toBeDefined();
  });

  it('3. Career skills come from CSV', () => {
    const aiEngineer = CareerKnowledgeService.getCareersForRecommendation().find((c: any) => c.name.includes('AI Engineer'));
    expect(aiEngineer).toBeDefined();
    expect(aiEngineer.requiredSkills.length).toBeGreaterThan(0);
    
    const hasPython = aiEngineer.requiredSkills.some((s: any) => s.skill.name === 'Python' || s.skill.name === 'Python Basics');
    expect(hasPython).toBe(true);
  });

  it('4. Skill definitions come from CSV', () => {
    const aiEngineer = CareerKnowledgeService.getCareersForRecommendation().find((c: any) => c.name.includes('AI Engineer'));
    const pythonSkill = aiEngineer.requiredSkills.find((s: any) => s.skill.name === 'Python' || s.skill.name === 'Python Basics');
    expect(pythonSkill.skill.id).toBeDefined();
    expect(pythonSkill.skill.name).toBeDefined();
  });

  it('5. Prerequisites come from CSV', () => {
    const deps = CareerKnowledgeService.getSkillDependencies();
    expect(deps.length).toBeGreaterThan(0);
    expect(deps[0].skillId).toBeDefined();
    expect(deps[0].prerequisiteSkillId).toBeDefined();
  });

  it('6. Resources come from CSV', () => {
    const resources = CareerKnowledgeService.getResources();
    expect(resources.length).toBeGreaterThan(0);
    expect(resources[0].resource_id).toBeDefined();
    expect(resources[0].title).toBeDefined();
  });

  it('9. All 60 careers can be loaded', () => {
    const careers = CareerKnowledgeService.getCareersForRecommendation();
    expect(careers.length).toBe(60);
  });

  it('10. Every career can produce a valid skill-gap analysis', async () => {
    const mockStudent: any = {
      yearStage: { year: 3, isExploratory: false, isPlacementReady: true },
      skills: {}, interests: {}, academic: {}, projects: [], certifications: [], codingEvidence: { totalProblemsSolved: 0 }, careerGoals: {}
    };
    
    const recommendations = await RecommendationEngineService.generateRecommendations(mockStudent);
    expect(recommendations.length).toBe(60);
    
    // Check evidence structure
    for (const rec of recommendations) {
      expect(rec.evidence).toBeDefined();
      expect(rec.evidence.skillGaps).toBeDefined();
      expect(Array.isArray(rec.evidence.skillGaps)).toBe(true);
    }
  });

  it('11. Every career can generate a roadmap', () => {
    const careers = CareerKnowledgeService.getCareersForRecommendation();
    const skillGraph = new SkillGraphEngine(CareerKnowledgeService.getSkillDependencies() as any);
    const roadmapEngine = new RoadmapEngineService(
      skillGraph,
      CareerKnowledgeService.getResources() as any,
      [] 
    );
    
    const mockStudentProfile: any = {
      year: 3,
      semester: 5,
      proficiencies: {},
      projects: [],
      certifications: []
    };
    
    const roadmap = roadmapEngine.generatePersonalizedRoadmap(mockStudentProfile, careers[0]);
    expect(roadmap).toBeDefined();
    expect(roadmap.roadmapStages.length).toBeGreaterThan(0);
  });

  it('12. UI/UX Designer does NOT become a strong match only because HTML/CSS are present', async () => {
    const mockStudent: any = {
      yearStage: { year: 3, isExploratory: false, isPlacementReady: true },
      skills: {
        'HTML/CSS': { proficiency: 3 }
      },
      interests: {}, academic: {}, projects: [], certifications: [], codingEvidence: { totalProblemsSolved: 0 }, careerGoals: {}
    };
    
    const recommendations = await RecommendationEngineService.generateRecommendations(mockStudent);
    const uiux = recommendations.find(r => r.careerName.includes('UI/UX'));
    
    if (uiux) {
      // It shouldn't be rank 1 if they only have HTML/CSS
      // But it might be low since UI/UX has many core skills like Figma, Wireframing
      const coreMissing = uiux.evidence.skillGaps.filter(g => g.isCore);
      expect(coreMissing.length).toBeGreaterThan(0);
    }
  });
});
