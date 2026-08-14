const fs = require('fs');
const t = fs.readFileSync('./src/data/exerciseDatasetMock.ts', 'utf-8');
const regex = /"primary_muscles":\s*\[\s*"([^"]+)"/g;
const muscles = new Set();
let match;
while ((match = regex.exec(t)) !== null) {
  muscles.add(match[1]);
}
console.log(Array.from(muscles).sort());
