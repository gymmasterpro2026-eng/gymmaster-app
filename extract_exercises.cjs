const fs = require('fs');
const path = require('path');

const datasetDir = path.join(__dirname, 'exercises-dataset');
const dataFile = path.join(datasetDir, 'data', 'exercises.json');
const publicImagesDir = path.join(__dirname, 'public', 'images');
const publicVideosDir = path.join(__dirname, 'public', 'videos');
const outputFile = path.join(__dirname, 'src', 'data', 'exerciseDatasetMock.ts');

if (!fs.existsSync(publicImagesDir)) fs.mkdirSync(publicImagesDir, { recursive: true });
if (!fs.existsSync(publicVideosDir)) fs.mkdirSync(publicVideosDir, { recursive: true });

const allData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const selected = [];
const targets = new Set();
for (const ex of allData) {
    selected.push(ex);
    targets.add(ex.target);
}

const mockData = selected.map(ex => {
    const imgName = path.basename(ex.image || '');
    const srcImg = path.join(datasetDir, ex.image || '');
    const destImg = path.join(publicImagesDir, imgName);
    if (imgName && fs.existsSync(srcImg)) fs.copyFileSync(srcImg, destImg);

    let gifName = '';
    if (ex.gif_url) {
        gifName = path.basename(ex.gif_url);
        const srcGif = path.join(datasetDir, ex.gif_url);
        const destGif = path.join(publicVideosDir, gifName);
        if (gifName && fs.existsSync(srcGif)) fs.copyFileSync(srcGif, destGif);
    }
    
    // Fallbacks to avoid crashing Array methods like .some()
    const instructions = ex.instruction_steps && ex.instruction_steps.es 
        ? ex.instruction_steps.es 
        : [ex.instructions && ex.instructions.es ? ex.instructions.es : 'Realizar con técnica controlada.'];

    return {
        id: `ex-${ex.id}`,
        name: ex.name,
        level: 'intermediate',
        equipment: 'body weight',
        primary_muscles: [ex.target || ex.muscle_group || 'general'],
        secondary_muscles: ex.secondary_muscles || [],
        instructions: instructions,
        image_urls: [gifName ? `/videos/${gifName}` : '', `/images/${imgName}`].filter(Boolean),
    };
});

const fileContent = `import { Exercise } from '../types';

export const INITIAL_EXERCISES: Exercise[] = ${JSON.stringify(mockData, null, 2)};
`;

fs.writeFileSync(outputFile, fileContent);
console.log(`Successfully extracted ${selected.length} exercises and fixed their schema.`);
