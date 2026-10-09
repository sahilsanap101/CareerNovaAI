import { isJobRelevantForCareer } from '../src/modules/jobs/services/careerRelevance.service';
const titles = ['Full Stack Developer', 'Full Stack Engineer', 'Fullstack Developer', 'MERN Developer', 'Web Developer', 'Software Engineer'];
for (const t of titles) {
  console.log(t, '->', isJobRelevantForCareer(t, 'frontend backend', 'Full Stack Developer'));
}
