const fs = require("fs").promises;

module.exports = function removeDirectory(directoryPath) {
  return fs.rm(directoryPath, { recursive: true, force: true });
}