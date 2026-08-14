const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('muscle.html', 'utf-8');
const $ = cheerio.load(html);

const exercises = [];

// The class might be something like .exercise-card or .exercise-name. 
// We will look for anything that looks like an exercise. Musclewiki usually uses h3 or h2 for exercise titles, and a video element.

$('div').each((i, el) => {
    // try to find h3 elements inside. Musclewiki might have a specific structure.
});

// Let's print out all h3 tags to guess the structure.
const h3s = [];
$('h3').each((i, el) => {
    h3s.push($(el).text().trim());
});

console.log("H3s:", h3s);

const videos = [];
$('video source').each((i, el) => {
    videos.push($(el).attr('src'));
});

console.log("Videos:", videos);
