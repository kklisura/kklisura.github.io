const Handlebars = require('handlebars');
const moment = require('moment');


Handlebars.registerHelper('formatted-date', function (date, format) {
  if (!date || !date.trim()) {
    return '';
  }
  if (date === 'now') {
    return moment().format(format);
  }
  return moment(date, 'YYYY-MM-DD').format(format);
});

module.exports = function processHtmlTemplate(content, context) {
  const template = Handlebars.compile(content);
  return template(context);
}