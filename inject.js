const fs = require('fs');
const path = require('path');
const p = path.resolve(__dirname, 'apps/web/src/pages/Profile/ProfileWizard.tsx');
let txt = fs.readFileSync(p, 'utf8');

const regex = /<(Input|Textarea)[^>]*\{\.\.\.(\w+)\.register\('([^']+)'[^}]*\}\)[^>]*\/>/g;

txt = txt.replace(regex, (match, comp, formName, fieldName) => {
    if (match.includes('error={')) return match;
    return match.replace(
        ' />',
        ' error={' + formName + '.formState.errors.' + fieldName + '?.message as string} />'
    );
});

const regexOpen = /<(Select|Checkbox)[^>]*\{\.\.\.(\w+)\.register\('([^']+)'[^}]*\}\)[^>]*>/g;
txt = txt.replace(regexOpen, (match, comp, formName, fieldName) => {
    if (match.includes('error={')) return match;
    return match.replace(
        '>',
        ' error={' + formName + '.formState.errors.' + fieldName + '?.message as string}>'
    );
});

fs.writeFileSync(p, txt);
console.log('Replaced successfully');
