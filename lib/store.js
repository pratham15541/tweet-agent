import fs from 'fs';
const FILE = 'posted.json';

export function loadHistory() {
  return fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE)) : [];
}

export function saveHistory(list) {
  fs.writeFileSync(FILE, JSON.stringify(list.slice(-100), null, 2)); // keep last 100
}