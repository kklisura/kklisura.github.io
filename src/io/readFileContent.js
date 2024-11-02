const fs = require('fs').promises;
const { error } = require('../utils/logging');

module.exports = async function readFileContent(filePath, offset = 0, size = -1) {
  try {
    if (offset == 0 && size == -1) {
      const data = await fs.readFile(filePath, 'utf8');
      return data;
    } else {
      const fd = await fs.open(filePath, 'r');
      let buffer = Buffer.alloc(size);
      const { bytesRead } = await fd.read(buffer, 0, size, offset);

      return {
        content: buffer.toString('utf8', 0, bytesRead),
        bytesRead
      }
    }
  } catch (err) {
    error(`Error reading ${filePath}`, err);
    throw error;
  }
}