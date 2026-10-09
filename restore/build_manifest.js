const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const backupDir = 'c:\\Users\\ankit\\Downloads\\PATHFORGE (1)\\backup\\pre_restore_current_state_20261007_011439\\PATHFORGE';
const manifestPath = 'prompt15_backup_manifest.json';
const files = [];
function walk(d) {
  const items = fs.readdirSync(d);
  items.forEach(f => {
    if (f === 'node_modules' || f === '.git') return;
    const p = path.join(d, f);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p);
    else {
      const hash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
      files.push({
        path: path.relative(backupDir, p).replace(/\\/g, '/'),
        size: stat.size,
        mtime: stat.mtime,
        hash
      });
    }
  });
}
walk(backupDir);
fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2));
console.log("Manifest created.");
