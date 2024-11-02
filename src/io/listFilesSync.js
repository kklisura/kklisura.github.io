const fs = require('fs');
const path = require('path');

module.exports = function listFilesSync(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  fileDetails = files.map(file => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    const parsedFile = path.parse(file);

    return {
      name: parsedFile.name,
      extension: parsedFile.ext,
      directory: path.dirname(filePath),
      path: filePath,
      isDirectory: stats.isDirectory(),
    };
  })
  return fileDetails
    .filter((stats) => !stats.isDirectory)
    .filter((stats) => stats.name.indexOf('.') != 0)
    .map(({ isDirectory: _isDirectory, ...stats }) => {
      return stats;
    })
}