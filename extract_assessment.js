const fs = require('fs');

const { readFileSync } = require('fs');
const content = readFileSync('eval_assessment.ts', 'utf8');

// The file has `const assessmentData = [ ... ];`
// Let's use regex to extract it
const match = content.match(/const assessmentData = (\[[\s\S]*?\]);\n\nfunction main/);
if (match) {
    // Evaluate the object in javascript
    const assessmentData = eval(match[1]);
    fs.writeFileSync('c:/Users/ankit/Downloads/PATHFORGE (1)/PATHFORGE/research/experiments/career_model_comparison/assessment_data.json', JSON.stringify(assessmentData, null, 2));
    console.log("Extracted assessment data as valid JSON");
} else {
    console.log("Failed to match");
}
