const fs = require('fs');
const fp = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/LandingPage.tsx';
let content = fs.readFileSync(fp, 'utf8');

// Change the icon from Dumbbell to Activity or similar for a more premium look
content = content.replace(/<Dumbbell/g, '<Activity');

// Specifically update the import to ensure Activity is imported
content = content.replace(/import { Dumbbell/g, 'import { Activity, Dumbbell');

// Update background image
content = content.replace(/background:\s*'url\(https:\/\/images\.unsplash\.com[^']+'\)/g, "background: 'url(/gym_model_background.png) center/cover no-repeat'");

fs.writeFileSync(fp, content);
console.log('Updated background and icon in LandingPage.');
