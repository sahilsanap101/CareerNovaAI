const fs = require('fs');
const file = './src/pages/Recommendations/Recommendations.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/import \{ FeedbackSurvey \} from '\.\/FeedbackSurvey';\n/, '');
content = content.replace(/<FeedbackSurvey recommendationId=\{selectedRec\.id\} \/>/, '');
fs.writeFileSync(file, content);
console.log('FeedbackSurvey removed.');
