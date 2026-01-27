const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const run = (cmd, cwd) => {
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: 'inherit', cwd: cwd || process.cwd() });
};

const distDir = path.join(__dirname, 'dist');
const frontendDir = path.join(__dirname, 'frontend');

// 1. Clean dist
console.log('🧹 Cleaning dist...');
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// 2. Build Frontend
console.log('🏗️  Building Frontend...');
run('npm install', frontendDir);
run('npm run build', frontendDir);

// 3. Copy Frontend Artifacts
console.log('📂 Copying Artifacts...');
const src = path.join(frontendDir, 'out');
const dest = path.join(distDir, 'frontend');

if (!fs.existsSync(src)) {
    console.error('❌ Build failed: out/ folder not found in frontend.');
    process.exit(1);
}

// Ensure dest exists
fs.mkdirSync(dest, { recursive: true });

// Copy recursively
fs.cpSync(src, dest, { recursive: true });

// 4. (Optional) Copy Documentation
const docsSrc = path.join(__dirname, 'Docs');
const docsDest = path.join(distDir, 'Docs');
if (fs.existsSync(docsSrc)) {
    console.log('📄 Copying Documentation...');
    fs.cpSync(docsSrc, docsDest, { recursive: true });
}

console.log('✅ Build Complete!');
