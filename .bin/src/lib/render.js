const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

const { TEMPLATES_DIR, PARTIALS_DIR, site, nav } = require('./config');

Handlebars.registerHelper('eq', (a, b) => a === b);
Handlebars.registerHelper('year', () => new Date().getFullYear());

function registerPartials() {
  if (!fs.existsSync(PARTIALS_DIR)) return;
  for (const file of fs.readdirSync(PARTIALS_DIR)) {
    if (!file.endsWith('.hbs')) continue;
    const name = path.basename(file, '.hbs');
    const source = fs.readFileSync(path.join(PARTIALS_DIR, file), 'utf8');
    Handlebars.registerPartial(name, source);
  }
}

function compileTemplate(name) {
  const source = fs.readFileSync(path.join(TEMPLATES_DIR, `${name}.hbs`), 'utf8');
  return Handlebars.compile(source);
}

registerPartials();

const templates = {
  layout: compileTemplate('layout'),
  index: compileTemplate('index'),
  post: compileTemplate('post'),
  page: compileTemplate('page'),
  404: compileTemplate('404'),
};

function renderPage(templateName, context) {
  const body = templates[templateName](context);
  return templates.layout({
    site,
    nav,
    ...context,
    body,
  });
}

module.exports = { renderPage };
