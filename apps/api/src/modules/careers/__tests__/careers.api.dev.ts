import { Request, Response, NextFunction } from 'express';
import { getRecommendations } from '../controllers/careers.controller';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runApiTest() {
  console.log('🌐 Testing /api/v1/career-recommendation/recommendations\n');

  // Find the seeded student user to test with
  const student = await prisma.user.findUnique({
    where: { email: 'student@pathforge.dev' },
  });

  if (!student) {
    console.error('Student user not found in DB. Did you run the seed?');
    process.exit(1);
  }

  // Mock Request
  const req = {
    user: {
      sub: student.id,
      email: student.email,
      role: student.role,
    }
  } as unknown as Request;

  // Mock Response
  let responsePayload: any = null;
  const res: any = {
    statusCode: 200,
    status: function (code: number) {
      this.statusCode = code;
      return this;
    },
    json: function (payload: any) {
      responsePayload = payload;
      return this;
    }
  };

  // Mock Next
  const next: NextFunction = (err?: any) => {
    console.error('Next called with error:', err);
  };

  // Run controller
  await getRecommendations(req, res, next);

  if (responsePayload && responsePayload.success) {
    console.log(`✅ API Response Success!`);
    console.log(`Generated At: ${responsePayload.data.generatedAt}`);
    console.log(`Profile Completeness: ${responsePayload.data.profileCompleteness}%`);
    console.log(`Top Recommendation: ${responsePayload.data.recommendations[0]?.careerName}`);
    
    // Dump first recommendation
    console.log('\nTop Recommendation Details:');
    console.log(JSON.stringify(responsePayload.data.recommendations[0], null, 2));
  } else {
    console.error('❌ API Test Failed:', responsePayload);
  }

  await prisma.$disconnect();
}

runApiTest();
