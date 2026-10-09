import { CareerKnowledgeService } from './modules/careers/services/careerKnowledge.service';

const skills = CareerKnowledgeService.getAllSkills();
console.log(skills.map((s: any) => s.name));
