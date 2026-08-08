const fs = require('fs');
const path = require('path');

// 1. Fix DashboardCoach.tsx (Light Theme Cards)
const dcPath = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/DashboardCoach.tsx';
let dcContent = fs.readFileSync(dcPath, 'utf8');
// Fix coach header card
dcContent = dcContent.replace(/background:\s*'#0f172a',/g, "background: '#ffffff',");
dcContent = dcContent.replace(/border:\s*'1px solid #1e293b',/g, "border: '1px solid #e2e8f0',");
// Fix typography
dcContent = dcContent.replace(/color:\s*'#fff',/g, "color: '#0f172a',");
dcContent = dcContent.replace(/color:\s*'rgba\\(255,255,255,0.4\\)',/g, "color: '#64748b',");
// Fix Nuevo Alumno button
dcContent = dcContent.replace(/background:\s*'transparent', border:\s*'1px solid rgba\\(255,255,255,0.1\\)', color:\s*'#0f172a',/g, "background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a',");
// Fix CREAR RUTINA button
dcContent = dcContent.replace(/background:\s*'#f59e0b', color:\s*'#0f172a',/g, "background: '#1e3a8a', color: '#ffffff',");
// Fix user cards (alumnosList)
dcContent = dcContent.replace(/background:\s*'#1e293b'/g, "background: '#ffffff'");
dcContent = dcContent.replace(/background:\s*'#334155'/g, "background: '#f8fafc'");
// Fix buttons
dcContent = dcContent.replace(/background:\s*'rgba\\(245,158,11,0.1\\)', color:\s*'#f59e0b'/g, "background: '#e0e7ff', color: '#1e3a8a'");
dcContent = dcContent.replace(/border:\s*'1px solid rgba\\(245,158,11,0.2\\)'/g, "border: '1px solid #c7d2fe'");
dcContent = dcContent.replace(/background:\s*'#0f172a', border:\s*'1px solid #334155', color:\s*'#f59e0b'/g, "background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0f172a'");
fs.writeFileSync(dcPath, dcContent);
console.log('Updated DashboardCoach.tsx');

// 2. Fix SqlSchemaViewer.tsx and FolderStructureViewer.tsx (Dark Theme Cards with specific accents)
const sqlPath = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/SqlSchemaViewer.tsx';
if (fs.existsSync(sqlPath)) {
  let sqlContent = fs.readFileSync(sqlPath, 'utf8');
  // Replace black/dark with slate-900
  sqlContent = sqlContent.replace(/#0A0A0A/gi, '#0f172a');
  sqlContent = sqlContent.replace(/#1A1A1A/gi, '#1e293b');
  sqlContent = sqlContent.replace(/#111111/gi, '#1e293b');
  sqlContent = sqlContent.replace(/#222222/gi, '#334155');
  sqlContent = sqlContent.replace(/#D4FF00/gi, '#10b981'); // Lime to emerald for rules
  fs.writeFileSync(sqlPath, sqlContent);
  console.log('Updated SqlSchemaViewer.tsx');
}

const folderPath = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/FolderStructureViewer.tsx';
if (fs.existsSync(folderPath)) {
  let folderContent = fs.readFileSync(folderPath, 'utf8');
  folderContent = folderContent.replace(/#0A0A0A/gi, '#0f172a');
  folderContent = folderContent.replace(/#1A1A1A/gi, '#1e293b');
  folderContent = folderContent.replace(/#111111/gi, '#1e293b');
  folderContent = folderContent.replace(/#222222/gi, '#334155');
  folderContent = folderContent.replace(/#D4FF00/gi, '#f59e0b');
  fs.writeFileSync(folderPath, folderContent);
  console.log('Updated FolderStructureViewer.tsx');
}

// 3. Fix GymManager.tsx (Ensure it matches screenshot: dark grey bg, lime button)
const gymPath = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/GymManager.tsx';
let gymContent = fs.readFileSync(gymPath, 'utf8');
// It already has #0f172a from previous replace, but we want #111827
gymContent = gymContent.replace(/background:\s*'#0f172a'/g, "background: '#111827'");
// We want the submit button to be Lime Green #D4FF00, but previous script made it Amber #f59e0b
gymContent = gymContent.replace(/background:\s*'linear-gradient\\(135deg, #f59e0b, #a8cc00\\)'/g, "background: '#D4FF00'");
gymContent = gymContent.replace(/background:\s*'#f59e0b'/g, "background: '#D4FF00'");
gymContent = gymContent.replace(/color:\s*'#f59e0b'/g, "color: '#D4FF00'");
fs.writeFileSync(gymPath, gymContent);
console.log('Updated GymManager.tsx');
