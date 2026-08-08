const fs = require('fs');
const path = require('path');
const fp = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/Navbar.tsx';
let content = fs.readFileSync(fp, 'utf8');

// Navbar background
content = content.replace(/background:\s*'#0f172a',/g, "background: '#cbd5e1',");
// Borders
content = content.replace(/borderRight:\s*'1px solid rgba\(255,255,255,0.06\)',/g, "borderRight: '1px solid #94a3b8',");
content = content.replace(/borderBottom:\s*'1px solid rgba\(255,255,255,0.06\)',/g, "borderBottom: '1px solid #94a3b8',");
content = content.replace(/borderTop:\s*'1px solid rgba\(255,255,255,0.06\)',/g, "borderTop: '1px solid #94a3b8',");
// Texts
content = content.replace(/color:\s*'#ffffff',/g, "color: '#0f172a',"); // logoTitle
content = content.replace(/color:\s*'rgba\(255,255,255,0.4\)',/g, "color: '#475569',"); // logoGym
content = content.replace(/color:\s*'rgba\(255,255,255,0.25\)',/g, "color: '#475569',"); // sectionLabel

// NavButton colors
content = content.replace(/iconColor = 'rgba\\(255,255,255,0.5\\)'/g, "iconColor = '#0f172a'");
content = content.replace(/background: active\s+\?\s+'rgba\(245,158,11,0.12\)'\s+:\s+hovered\s+\?\s+'rgba\(255,255,255,0.05\)'\s+:\s+'transparent'/g, "background: active ? '#0f172a' : hovered ? '#94a3b8' : 'transparent'");
content = content.replace(/color: active \? '#f59e0b' : 'rgba\(255,255,255,0.75\)'/g, "color: active ? '#fff' : '#0f172a'");
content = content.replace(/borderLeft: active \? '2px solid #f59e0b' : '2px solid transparent'/g, "borderLeft: 'none'");
content = content.replace(/color: active \? '#f59e0b' : iconColor/g, "color: active ? '#fff' : iconColor");
content = content.replace(/color: active \? '#f59e0b' : 'rgba\(255,255,255,0.2\)'/g, "color: active ? '#fff' : '#0f172a'");

// Logo Icon
content = content.replace(/background:\s*'linear-gradient\(135deg, #f59e0b, #a8cc00\)'/g, "background: '#fff'");
content = content.replace(/<Dumbbell size=\{20\} color="#000" \/>/g, "<Dumbbell size={20} color=\"#0f172a\" />");

fs.writeFileSync(fp, content);
console.log('Updated Navbar.tsx');

// Now let's fix ExerciseCatalog.tsx colors to match image
const fp2 = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/ExerciseCatalog.tsx';
let content2 = fs.readFileSync(fp2, 'utf8');

// The image shows the top banner having a dark slate background, let's say #64748b or just a linear-gradient
content2 = content2.replace(/background: 'linear-gradient\\(135deg, #111827, #1f2937, #451a03\\)'/g, "background: 'linear-gradient(135deg, #334155, #64748b)'");
content2 = content2.replace(/border: '1px solid #1f2937',/g, "border: '1px solid #475569',");

// Active button is amber with black text
content2 = content2.replace(/color: '#000',/g, "color: '#0f172a',");

fs.writeFileSync(fp2, content2);
console.log('Updated ExerciseCatalog.tsx');
