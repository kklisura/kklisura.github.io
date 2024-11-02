const fs = require('fs').promises;
const path = require('path');

module.exports = async function writeContentToFile(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  return fs.writeFile(file, content, { encoding: 'utf8' });
}