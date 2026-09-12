const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let files;
try {
    files = execSync('git ls-files').toString().replace(/\r\n/g, '\n').split('\n').filter(Boolean);
} catch (e) {
    console.error("Failed to run git ls-files", e);
    process.exit(1);
}

let count = 0;
for (let file of files) {
    file = file.trim(); // strip \r and spaces just in case
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const content = fs.readFileSync(file, 'utf8');
        let newContent = content
            .replace(/PathForge/g, 'PathForge')
            .replace(/pathforge/g, 'pathforge')
            .replace(/PATHFORGE/g, 'PATHFORGE');

        if (content !== newContent) {
            fs.writeFileSync(file, newContent, 'utf8');
            count++;
        }
    } else {
        console.log(`Could not find or is not file: ${file}`);
    }
}
console.log(`Modified ${count} files.`);
