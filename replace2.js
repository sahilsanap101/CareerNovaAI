const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') continue;
        const filePath = path.resolve(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            results.push(filePath);
        }
    }
    return results;
}

const files = walk('.');
let count = 0;
for (const file of files) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        let newContent = content
            .replace(/PathForge/g, 'PathForge')
            .replace(/pathforge/g, 'pathforge')
            .replace(/PATHFORGE/g, 'PATHFORGE');

        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            count++;
        }
    } catch (e) {
        // block errors like reading binaries as utf8
    }
}
console.log(`Modified ${count} files.`);
