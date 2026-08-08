const fs = require('fs');
const fp = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/LandingPage.tsx';
let content = fs.readFileSync(fp, 'utf8');

// Replace custom SVG logo with Activity icon from lucide-react
content = content.replace(/<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2\.5" strokeLinecap="round" strokeLinejoin="round">[\s\S]*?<\/svg>/, '<Activity size={32} color="#000" />');

// Fix input styling to match screenshot (light background, dark text)
content = content.replace(/background:\s*'rgba\(0,0,0,0\.4\)'/g, "background: '#e2e8f0'");
content = content.replace(/color:\s*'#ffffff', fontSize:\s*'14px'/g, "color: '#0f172a', fontSize: '14px'");
content = content.replace(/color:\s*'rgba\(255,255,255,0\.25\)'/g, "color: '#64748b'"); // icons
content = content.replace(/input\[data-gm\]::placeholder \{ color: rgba\(255,255,255,0\.2\) !important; \}/g, "input[data-gm]::placeholder { color: #94a3b8 !important; }");

// Let's also fix the onFocus and onBlur styles for the input which are hardcoded inline
content = content.replace(/e\.target\.style\.background = 'rgba\(0,0,0,0\.6\)';/g, "e.target.style.background = '#f8fafc';");
content = content.replace(/e\.target\.style\.background = 'rgba\(0,0,0,0\.4\)';/g, "e.target.style.background = '#e2e8f0';");

fs.writeFileSync(fp, content);
console.log('Fixed landing page logo and inputs');
