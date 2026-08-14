const fs = require('fs');
const t = fs.readFileSync('./src/data/exerciseDatasetMock.ts', 'utf-8');
const regex = /"level":\s*"([^"]+)"/g;
const levels = new Set();
let match;
while ((match = regex.exec(t)) !== null) {
  levels.add(match[1]);
}
console.log(Array.from(levels).sort());
