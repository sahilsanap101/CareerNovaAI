const { execSync } = require('child_process');
const fs = require('fs');

try {
    const stdout = execSync('npx tsc --noEmit', { stdio: 'pipe' }).toString();
    fs.writeFileSync('out2.txt', stdout);
} catch (err) {
    fs.writeFileSync('out2.txt', (err.stdout ? err.stdout.toString() : '') + '\\n' + (err.stderr ? err.stderr.toString() : ''));
}

try {
    const stdout = execSync('npm run lint', { stdio: 'pipe' }).toString();
    fs.writeFileSync('lint2.txt', stdout);
} catch (err) {
    fs.writeFileSync('lint2.txt', (err.stdout ? err.stdout.toString() : '') + '\\n' + (err.stderr ? err.stderr.toString() : ''));
}

console.log('Done synchronously!');
