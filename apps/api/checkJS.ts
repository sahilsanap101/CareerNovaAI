const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');
tsConfigPaths.register({ baseUrl: './', paths: tsConfig.compilerOptions.paths });
const { getAllCareerPathsWithSkills } = require('./src/modules/recommendations/repositories/recommendation.repository');

async function run() {
  const careers = await getAllCareerPathsWithSkills();
  const career = careers.find(c => c.name === "Full Stack Developer");
  
  const jsReq = career.skillRequirements.find(req => req.canonicalSkill.skill.name === 'JavaScript');
  console.log('JavaScript Req:', JSON.stringify(jsReq, null, 2));
}
run().catch(console.error).finally(() => process.exit(0));
