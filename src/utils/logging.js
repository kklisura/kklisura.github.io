
function error(...args) {
  console.log('[ERROR]', ...args);
}

function info(...args) {
  console.log('[INFO]', ...args);
}

function warning(...args) {
  console.log('[WARNING]', ...args);
}

module.exports = {
  error,
  info,
  warning,
}