const showdown = require('showdown');

let CONVERTER = null;

function initializeConverter() {
  showdown.setFlavor('github');
  CONVERTER = new showdown.Converter();
}

module.exports = function processMarkdownTemplate(content, context) {
  if (CONVERTER == null) {
    initializeConverter();
  }
  return CONVERTER.makeHtml(content);
}