const fs = require('fs');
const path = require('path');

function getAllFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) files.push(...getAllFiles(full));
    else if (f.endsWith('.js') && !full.includes('.next')) files.push(full);
  }
  return files;
}

// 1. Build lib exports map
const libExports = {};
const libFiles = getAllFiles('lib');
for (const f of libFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const libName = path.basename(f, '.js');
  const matches = content.match(/export\s+(?:async\s+)?function\s+(\w+)/g) || [];
  libExports[libName] = matches.map(m => m.replace(/export\s+(?:async\s+)?function\s+/, ''));
}

console.log('\n=== LIB EXPORTS ===');
for (const [lib, exps] of Object.entries(libExports)) {
  if (exps.length) console.log(`  ${lib}: ${exps.join(', ')}`);
}

// 2. Scan all source files for import issues
const allFiles = [
  ...getAllFiles('app'),
  ...getAllFiles('components'),
  ...getAllFiles('lib')
].filter(f => !f.includes('.next'));

console.log('\n=== IMPORT AUDIT ===');
let issues = 0;
const importRe = /import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/(\w+)['"]/g;

for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  importRe.lastIndex = 0;
  while ((m = importRe.exec(content)) !== null) {
    const imports = m[1].split(',').map(s => s.trim().split(' as ')[0].trim()).filter(Boolean);
    const libName = m[2];
    if (libExports[libName]) {
      for (const imp of imports) {
        if (!libExports[libName].includes(imp)) {
          console.log(`  BROKEN: ${path.relative('.', f)}`);
          console.log(`    { ${imp} } from @/lib/${libName}`);
          console.log(`    Available: ${libExports[libName].join(', ') || '(none)'}`);
          issues++;
        }
      }
    }
  }
}
if (!issues) console.log('  No broken imports found!');

// 3. Check all API routes have proper error handling
console.log('\n=== API ROUTE CHECK ===');
const apiFiles = getAllFiles('app/api');
let missingTryCatch = 0;
for (const f of apiFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const hasExport = content.includes('export async function') || content.includes('export function');
  const hasTryCatch = content.includes('try {') || content.includes('try{');
  if (hasExport && !hasTryCatch) {
    console.log(`  NO TRY/CATCH: ${path.relative('.', f)}`);
    missingTryCatch++;
  }
}
if (!missingTryCatch) console.log('  All API routes have error handling!');

// 4. Check for missing connectDB calls in API routes
console.log('\n=== MISSING connectDB CHECK ===');
let missingConnectDB = 0;
for (const f of apiFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const hasDB = content.includes('connectDB') || content.includes('mongoose');
  const hasModel = content.includes("from \"@/models/") || content.includes("from '@/models/");
  if (hasModel && !hasDB) {
    console.log(`  MISSING connectDB: ${path.relative('.', f)}`);
    missingConnectDB++;
  }
}
if (!missingConnectDB) console.log('  All DB-using routes call connectDB!');

// 5. Check env vars referenced
console.log('\n=== ENV VARS USED ===');
const envVars = new Set();
for (const f of allFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const matches = content.match(/process\.env\.([A-Z_]+)/g) || [];
  for (const m of matches) envVars.add(m.replace('process.env.', ''));
}
console.log('  Referenced:', [...envVars].sort().join(', '));

// Check .env.local
const envFile = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const definedVars = new Set(envFile.match(/^([A-Z_]+)=/gm)?.map(s => s.slice(0, -1)) || []);
const missingEnv = [...envVars].filter(v => !definedVars.has(v));
if (missingEnv.length) console.log('  MISSING in .env.local:', missingEnv.join(', '));
else console.log('  All env vars defined!');

console.log('\n=== AUDIT COMPLETE ===\n');
