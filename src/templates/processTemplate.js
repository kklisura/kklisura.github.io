
const processHtmlTemplate = require('./processHtmlTemplate');

module.exports = function processTemplate(content, type, context) {
  if (!content) {
    return content;
  }
  if (type !== 'html') {
    return content;
  }

  return processHtmlTemplate(content, context);
}