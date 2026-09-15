const { execSync } = require('child_process'); const fs = require('fs'); try { execSync('npm run build:api'); } catch (e) { fs.writeFileSync('err.txt', e.stdout.toString()); }
