const fs = require('fs');
const YAML = require('yaml')
const path = require('path');
const { warning } = require('../utils/logging');
const processMarkdownTemplate = require('./processMarkdownTemplate');

const PAGE_SIZE = 4096;

const STATE_READ_HEADER = 'STATE_READ_HEADER';
const STATE_READ_EXCERPT = 'STATE_READ_EXCERPT';
const STATE_READ_RAW_CONTENT = 'STATE_READ_RAW_CONTENT';
const STATE_READ_END = 'STATE_READ_END';

const ROOT = "_site";

function extensionToType(extension) {
  switch (extension.toLowerCase()) {
    case '.md':
      return 'markdown'
    case '.html':
      return 'html';
    default:
      throw `Unknown extension '${extension}'`
  }
}

function processMarkdownContent(content, type) {
  if (!content) {
    return content;
  }
  if (type !== 'markdown') {
    return content;
  }

  return processMarkdownTemplate(content);
}

function dateFromFileName(name) {
  const match = name.match(/^(\d{4}-\d?\d-\d?\d)-(.*)/);
  if (match) {
    return {
      date: match[1],
      name: match[2],
    };
  }
  return {
    date: null,
    name: name
  }
}

function resolveOutputFilePath(date, name, fileName, directory) {
  if (date) {
    const dateParts = date.split('-');
    return path.join(...dateParts, name) + '.html';
  } else {
    return path.join(fileName) + '.html';
  }
}

module.exports = function readTemplateFileSync({ name: fileName, path: filePath, extension: extension, directory: directory }) {
  const type = extensionToType(extension);
  const {
    date,
    name: nameWithoutDate
  } = dateFromFileName(fileName);

  let header = {};
  let rawExcerpt = '';
  let rawContent = '';

  let state = STATE_READ_HEADER;
  let offset = 0;

  let fd = null;

  try {
    fd = fs.openSync(filePath, 'r');

    const readBuffer = Buffer.alloc(PAGE_SIZE);

    while (state !== STATE_READ_END) {
      const bytesRead = fs.readSync(fd, readBuffer, 0, PAGE_SIZE, offset);
      rawContent += readBuffer.toString('utf8', 0, bytesRead);

      switch (state) {
        case STATE_READ_HEADER:
          {
            const index1 = rawContent.indexOf('---');
            const index2 = rawContent.indexOf('---', index1 + 1);

            if (index1 !== 0) {
              // There's no header in this template file
              state = STATE_READ_RAW_CONTENT;
              break;
            }
            if (index2 === -1) {
              // We need more data to read
              break;
            }

            const headerContent = rawContent.substring(index1 + 3, index2).trim();
            rawContent = rawContent.substring(index2 + 3).trimStart();

            header = YAML.parse(headerContent);
            if (header === null) {
              // There exist header in this file, but it's invalid for some reason
              warning(`Failed parsing header '${headerContent}' at file ${filePath}.`)
            }

            state = STATE_READ_EXCERPT;
          }

        case STATE_READ_EXCERPT:
          {
            let index1 = rawContent.indexOf('\n\n');

            if (index1 === 0) {
              rawContent = rawContent.trimStart();
              index1 = rawContent.indexOf('\n\n');
            }
            if (index1 === -1) {
              // We need more data to read
              break;
            }

            rawExcerpt = rawContent.substring(0, index1).trim();

            state = STATE_READ_RAW_CONTENT;
          }

        case STATE_READ_RAW_CONTENT:
          {
            // Read until the end
            if (bytesRead === 0) {
              state = STATE_READ_END;
            }
          }
      }

      offset += bytesRead;
    }
  } finally {
    if (fd !== null) {
      fs.closeSync(fd);
    }
  }

  const outputFilePath = resolveOutputFilePath(date, nameWithoutDate, fileName, directory);
  const relativePathPrefix = process.env.LOCAL_BUILD ? "" : "/";

  return {
    date,
    name: nameWithoutDate,
    header,
    type,
    relativePath: relativePathPrefix + outputFilePath,
    outputFilePath: outputFilePath,
    excerpt: processMarkdownContent(rawExcerpt, type),
    content: processMarkdownContent(rawContent, type)
  };
}
