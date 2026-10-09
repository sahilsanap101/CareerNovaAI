const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');
tsConfigPaths.register({ baseUrl: './', paths: tsConfig.compilerOptions.paths });
const { generateRecommendations } = require('./src/modules/recommendations/services/recommendation.service');
const { prisma } = require('./src/config/database');

async function run() {
  const user = await prisma.user.findFirst({ where: { fullName: 'Sahil Sanap' } });
  await generateRecommendations(user.id);
  console.log('Recommendations regenerated!');
}
run().catch(console.error).finally(() => process.exit(0));
