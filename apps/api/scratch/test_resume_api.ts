import { analyzeResume } from '../src/modules/ai/controllers/ai.controller';
import dotenv from 'dotenv';
dotenv.config();

async function runTest() {
  const req = {
    body: {
      resumeText: 'Sahil Resume: Java Python SQL Spring Boot REST APIs JWT Microservices Apache Kafka MySQL Git/GitHub DSA OOP NLP Scikit-learn TF-IDF Cosine Similarity',
      jobDescription: 'Infosys Specialist Programmer L1 (Trainee): Java Python SQL REST APIs'
    }
  } as any;

  const res = {
    status: function(code: number) { this.statusCode = code; return this; },
    json: function(data: any) { console.log('Response JSON:', JSON.stringify(data, null, 2)); return this; }
  } as any;

  const next = (err: any) => { console.error('Next called with error:', err); };

  console.log('Running analyzeResume...');
  await analyzeResume(req, res, next);
  console.log('Done.');
}

runTest().catch(console.error);
