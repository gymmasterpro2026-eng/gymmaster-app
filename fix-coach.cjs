const fs = require('fs');
const fp = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/DashboardCoach.tsx';
let content = fs.readFileSync(fp, 'utf8');

// 1. Remove rounded corners
content = content.replace(/borderRadius:\s*'[^']+'/g, "borderRadius: '0'");
content = content.replace(/borderRadius:\s*\d+/g, "borderRadius: 0");
content = content.replace(/rounded-\w+/g, "rounded-none");

// 2. Map colors to dark slate/amber theme
content = content.replace(/#D4FF00/gi, '#f59e0b');
content = content.replace(/rgba\(212,255,0,/g, 'rgba(245,158,11,');

content = content.replace(/#0A0A0A/gi, '#0f172a');
content = content.replace(/#1A1A1A/gi, '#1e293b');
content = content.replace(/#111111/gi, '#1e293b');
content = content.replace(/#111(?![0-9a-fA-F])/gi, '#1e293b');
content = content.replace(/#222222/gi, '#334155');
content = content.replace(/#222(?![0-9a-fA-F])/gi, '#334155');

fs.writeFileSync(fp, content);
console.log('Successfully fixed DashboardCoach to dark slate theme with square corners');
