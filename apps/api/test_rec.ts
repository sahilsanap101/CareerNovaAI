import { generateRecommendations } from '@/modules/recommendations/services/recommendation.service';
import { prisma } from '@/config/database';

async function test() {
  const user = await prisma.user.findUnique({where: {email: 'student@pathforge.dev'}});
  if (!user) throw new Error('no user');
  try {
    const recs = await generateRecommendations(user.id);
    console.log('success!', recs.length);
  } catch (e) {
    console.error('FAILED:', e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
