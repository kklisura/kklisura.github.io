const fs = require('fs').promises;
const path = require('path');
const { error } = require("../utils/logging");

module.exports = async function listFiles(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    const fileDetails = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(directoryPath, file);
        const stats = await fs.stat(filePath);
        const parsedFile = path.parse(file);

        return {
          name: parsedFile.name,
          extension: parsedFile.ext,
          directory: path.dirname(filePath),
          path: filePath,
          isDirectory: stats.isDirectory(),
        };
      })
    );
    return fileDetails
      .filter((stats) => !stats.isDirectory)
      .filter((stats) => stats.name.indexOf('.') != 0)
      .map(({ isDirectory: _isDirectory, ...stats }) => {
        return stats;
      })
  } catch (err) {
    error(`Error reading directory ${directoryPath}`, err);
    return [];
  }
}