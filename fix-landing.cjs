const fs = require('fs');
const fp = 'c:/Users/Usuario/.antigravity/gymmaster_pro/src/components/LandingPage.tsx';
let content = fs.readFileSync(fp, 'utf8');

// Replace background with image
content = content.replace(/background:\s*'#030303'/g, "background: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop) center/cover no-repeat'");

// Update card to heavy glassmorphism
content = content.replace(/background:\s*'rgba\\(255,255,255,0.02\\)'/g, "background: 'rgba(0,0,0,0.6)'");
content = content.replace(/border:\s*'1px solid rgba\\(255,255,255,0.08\\)'/g, "border: '1px solid rgba(255,255,255,0.15)'");

// Change logo to lime green
content = content.replace(/background:\s*'linear-gradient\\(135deg, #f59e0b, #a8cc00\\)'/g, "background: '#D4FF00'");
content = content.replace(/<Dumbbell\s+size={32}\s+color="#fff"\s+\/>/g, "<Dumbbell size={32} color=\"#000\" />");
content = content.replace(/<Dumbbell\s+size={20}\s+color="#fff"\s+\/>/g, "<Dumbbell size={20} color=\"#000\" />");

// Update button color to Lime Green instead of Amber
content = content.replace(/background:\s*'#f59e0b'/g, "background: '#D4FF00'");
content = content.replace(/background:\s*'rgba\\(245,158,11,0.9\\)'/g, "background: 'rgba(212,255,0,0.9)'");
content = content.replace(/color:\s*'#f59e0b'/g, "color: '#D4FF00'");

// Fix text strings
content = content.replace(/Plataforma SaaS para Entrenadores y Atletas/g, "Gestión inteligente de entrenamientos");
content = content.replace(/Acceder a mi cuenta/g, "INGRESAR AL SISTEMA");

// Make sure modal corners are square
content = content.replace(/borderRadius:\s*'[^']+'/g, "borderRadius: '0'");
content = content.replace(/borderRadius:\s*\d+/g, "borderRadius: 0");
content = content.replace(/rounded-\w+/g, "rounded-none");

fs.writeFileSync(fp, content);
console.log('Successfully updated LandingPage colors to match screenshot.');
