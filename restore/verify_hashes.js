const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const manifestPath = path.join(__dirname, 'prompt15_backup_manifest.json');
const outputPath = path.join(__dirname, 'prompt15_hash_verification.csv');
const projectDir = path.join(__dirname, '..');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const csvLines = ['path,backup_hash,restored_hash,match'];

let mismatchCount = 0;
let missingCount = 0;

for (const entry of manifest) {
  const p = path.join(projectDir, entry.path);
  let restoredHash = '';
  let match = 'false';
  
  if (fs.existsSync(p)) {
    try {
      restoredHash = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
      match = restoredHash === entry.hash ? 'true' : 'false';
      if (match === 'false') mismatchCount++;
    } catch (e) {
      restoredHash = 'ERROR';
      match = 'false';
      mismatchCount++;
    }
  } else {
    restoredHash = 'MISSING';
    match = 'false';
    missingCount++;
  }
  
  csvLines.push(`"${entry.path}",${entry.hash},${restoredHash},${match}`);
}

fs.writeFileSync(outputPath, csvLines.join('\n'));
console.log(`Verification complete. Mismatches: ${mismatchCount}, Missing: ${missingCount}`);
