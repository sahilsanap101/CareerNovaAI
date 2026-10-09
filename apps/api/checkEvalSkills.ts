const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');
tsConfigPaths.register({ baseUrl: './', paths: tsConfig.compilerOptions.paths });
const { getAllCareerPathsWithSkills } = require('./src/modules/recommendations/repositories/recommendation.repository');

async function run() {
  const careers = await getAllCareerPathsWithSkills();
  const career = careers.find(c => c.name === "Full Stack Developer");
  
  const evaluated = career.skillRequirements.filter(req => req.relationType === 'essential' || req.onetImportance !== null);
  console.log('Evaluated Skills:', evaluated.map(e => e.canonicalSkill.skill.name).join(', '));
}
run().catch(console.error).finally(() => process.exit(0));
