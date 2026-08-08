const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
files.push('../App.tsx');
let count = 0;
for (const f of files) {
  const fp = path.join(dir, f);
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;
  
  // Replace borderRadius inline styles
  content = content.replace(/borderRadius:\s*'[^']+'/g, "borderRadius: '0'");
  content = content.replace(/borderRadius:\s*\d+/g, "borderRadius: 0");
  
  // Replace Tailwind rounded classes if any remain
  content = content.replace(/rounded-\w+/g, "rounded-none");
  content = content.replace(/rounded-full/g, "rounded-none");
  content = content.replace(/rounded-2xl/g, "rounded-none");
  content = content.replace(/rounded-xl/g, "rounded-none");
  content = content.replace(/rounded-lg/g, "rounded-none");
  content = content.replace(/rounded-md/g, "rounded-none");
  content = content.replace(/rounded-sm/g, "rounded-none");
  content = content.replace(/rounded /g, "rounded-none ");
  
  if (content !== original) {
    fs.writeFileSync(fp, content);
    console.log('Updated ' + f);
    count++;
  }
}
console.log('Total updated: ' + count);
