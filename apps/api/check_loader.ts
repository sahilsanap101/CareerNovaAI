import { ResearchDataLoader } from '@/research_core/data/research_data_loader';
const loader = ResearchDataLoader.getInstance();
loader.load();
console.log('Status:', loader.getStatus());
console.log('Careers:', loader.getAllCareerPathsForEngine().length);
