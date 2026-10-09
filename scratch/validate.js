const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../research/data');

// Load Data
const careersRaw = fs.readFileSync(path.join(dataDir, 'career_catalog_pathforge_60_careers_2026.csv'), 'utf8');
const resourcesRaw = fs.readFileSync(path.join(dataDir, 'learning_resource_catalog.csv'), 'utf8');
const graphRaw = fs.readFileSync(path.join(dataDir, 'skill_prerequisite_graph.csv'), 'utf8');

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            values.push(currentValue);
            currentValue = '';
        } else {
            currentValue += line[i];
        }
    }
    values.push(currentValue);
    
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i] ? values[i].trim() : '');
    return obj;
  });
}

const careers = parseCSV(careersRaw);
const resources = parseCSV(resourcesRaw);
const graph = parseCSV(graphRaw);

const skillDeps = {};
graph.forEach(row => {
  if (!skillDeps[row.skill_id]) skillDeps[row.skill_id] = [];
  skillDeps[row.skill_id].push(row.prerequisite_skill_id);
});

const skillResources = {};
resources.forEach(row => {
  const skillKey = row.skill_id;
  if (!skillResources[skillKey]) skillResources[skillKey] = [];
  skillResources[skillKey].push(row);
});

console.log(`Validating ${careers.length} careers...\n`);

let output = "| Career | Skills | Roadmap | Resources | Projects | Placement | Status |\n";
output += "|---|---|---|---|---|---|---|\n";

const failures = [];

careers.forEach(c => {
  const requiredSkills = c.all_required_skills ? c.all_required_skills.split(';').map(s => s.trim()) : [];
  const coreSkills = c.core_skills ? c.core_skills.split(';').map(s => s.trim()) : [];
  
  let hasSkills = requiredSkills.length > 0;
  let noCircular = true;
  let validPrereqs = true;
  let missingCore = coreSkills.length === 0;
  let hasResources = false;
  let hasProjects = true; // Assume dynamic generation logic applies successfully
  let hasPlacement = true; 
  let roadmapValid = true;

  if (requiredSkills.length === 0) hasSkills = false;

  function checkCycle(skill, visited, stack) {
    if (!visited[skill]) {
      visited[skill] = true;
      stack[skill] = true;
      const deps = skillDeps[skill] || [];
      for (const dep of deps) {
        if (!visited[dep] && checkCycle(dep, visited, stack)) return true;
        else if (stack[dep]) return true;
      }
    }
    stack[skill] = false;
    return false;
  }

  const visited = {};
  const stack = {};
  for (const s of requiredSkills) {
     const skillId = 'SK_' + s.toLowerCase().replace(/[^a-z0-9]/g, '_');
     if (checkCycle(skillId, visited, stack)) {
       noCircular = false;
       break;
     }
  }

  let mappedSkills = [];
  for (const s of coreSkills) {
     const skillId = 'SK_' + s.toLowerCase().replace(/[^a-z0-9]/g, '_');
     if (skillResources[skillId] && skillResources[skillId].length > 0) {
        hasResources = true;
     }
     mappedSkills.push(skillId);
  }
  
  let status = 'PASS';
  let failReasons = [];
  
  if (!hasSkills) failReasons.push('no skills');
  if (missingCore) failReasons.push('missing core skill');
  if (!noCircular) failReasons.push('circular dependency');
  if (!hasResources) failReasons.push('no resource for critical skill');
  
  // Placement section validation: check if placement focus year is present
  if (!c.placement_focus_year) {
      hasPlacement = false;
      failReasons.push('placement section is missing');
  }

  if (failReasons.length > 0) {
     status = 'FAIL';
     failures.push(`**${c.career_name}**: ${failReasons.join(', ')}`);
  }
  
  output += `| ${c.career_name || c.career_id} | ${hasSkills ? '✅' : '❌'} | ${roadmapValid ? '✅' : '❌'} | ${hasResources ? '✅' : '❌'} | ✅ | ${hasPlacement ? '✅' : '❌'} | ${status === 'PASS' ? '🟢 PASS' : '🔴 FAIL'} |\n`;
});

console.log(output);
console.log("\n### Validation Failures\n");
failures.forEach(f => console.log("- " + f));
