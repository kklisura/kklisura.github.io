const MarkdownIt = require('markdown-it');
const footnote = require('markdown-it-footnote');
const anchor = require('markdown-it-anchor');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})
  .use(footnote)
  .use(anchor, { permalink: false });

module.exports = function renderMarkdown(source) {
  return md.render(source);
};
