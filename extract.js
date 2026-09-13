const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) getFiles(full, files);
        else if (full.endsWith('.json') && !file.includes('project_research_status.json')) files.push(full);
    });
    return files;
}

const allJson = getFiles(path.join(process.cwd(), 'research', 'results'));
const out = [];

allJson.forEach(f => {
    try {
        const d = JSON.parse(fs.readFileSync(f, 'utf8'));
        let brief = JSON.stringify(d).substring(0, 300);
        out.push({ file: path.basename(f), data: d });
        console.log(`[FILE]: ${f}`);
    } catch (e) { }
});

fs.writeFileSync(path.join(process.cwd(), 'research', 'results', 'FINAL_NUMERICAL_RESULTS.json'), JSON.stringify(out, null, 2));

const md = `# Final Numerical Results Extraction\n\n` + out.map(o => `### ${o.file}\n\`\`\`json\n${JSON.stringify(o.data, null, 2)}\n\`\`\``).join('\n\n');
fs.writeFileSync(path.join(process.cwd(), 'research', 'results', 'FINAL_NUMERICAL_RESULTS.md'), md);
fs.writeFileSync(path.join(process.cwd(), 'research', 'results', 'FINAL_NUMERICAL_RESULTS.csv'), `file,data\n` + out.map(o => `${o.file},${JSON.stringify(o.data).replace(/,/g, ';')}`).join('\n'));

console.log("Extraction complete.");
