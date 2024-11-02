const path = require("path");

const { series, parallel } = require("gulp");

const removeDirectory = require("./src/io/removeDirectory");
const listFilesSync = require("./src/io/listFilesSync");
const writeContentToFile = require("./src/io/writeContentToFile");
const readTemplateFileSync = require("./src/templates/readTemplateFileSync");
const processTemplate = require("./src/templates/processTemplate");
const config = require("./config.json");

const ROOT = "_site";
const OUTPUT_DIR = "_dist";
const LAYOUTS_DIR = "_layouts";
const POSTS_DIR = path.join(ROOT, "_posts");
const DRAFTS_DIR = path.join(ROOT, "_drafts");

let LAYOUTS_NAME_CACHE = null;
let CACHED_TEMPLATE_FILES = {};

function processFileTemplates(listOFFiles) {
  return listOFFiles.map((file) => {
    return {
      file,
      template: readTemplateFileSync(file)
    };
  });
}

const publicPosts = processFileTemplates(listFilesSync(POSTS_DIR));
const draftPosts = processFileTemplates(listFilesSync(DRAFTS_DIR));
const rootLevelPages = processFileTemplates(listFilesSync(ROOT));

const ALL_FILES = [...rootLevelPages, ...draftPosts, ...publicPosts];
const ALL_ARTICLE_FILES = [...draftPosts, ...publicPosts];

function findFile(listOfFiles, pathToFind) {
  pathToFind = path.join(ROOT, pathToFind);
  return listOfFiles.find((templateFile) => {
    return templateFile.file.path === pathToFind;
  });
}

function buildContext(innerContent, template, file) {
  const context = {
    page: {
      ...file,
      ...template,
      ...template.header
    },
    site: {
      url: config.url,
      lang: config.lang,
      title: config.title,
      headerPages: config.headerPages.map((page) => {
        return findFile(ALL_FILES, page);
      })
        .filter((page) => !!page)
        .map((templateFile) => {
          return {
            ...templateFile,
            ...templateFile.template,
            ...templateFile.template.header,
            isActive: templateFile.file === file
          };
        }),
      posts: ALL_ARTICLE_FILES.map((templateFile) => {
        return {
          ...templateFile,
          ...templateFile.template,
          ...templateFile.template.header,
          isActive: templateFile.file === file
        };
      })
    },
    content: innerContent
  };
  return context;
}

function initializeLayoutsNameCache() {
  const layouts = listFilesSync(path.join(ROOT, LAYOUTS_DIR));
  return layouts.reduce((memo, file) => {
    memo[file.name] = file;
    return memo;
  }, {})
}

function resolveLayoutFile(layout) {
  if (LAYOUTS_NAME_CACHE == null) {
    LAYOUTS_NAME_CACHE = initializeLayoutsNameCache();
  }
  if (!LAYOUTS_NAME_CACHE[layout]) {
    throw `Unknown layout ${layout} specified in some template!`;
  }
  return LAYOUTS_NAME_CACHE[layout];
}

function readCachedTemplateFile(file) {
  if (CACHED_TEMPLATE_FILES[file.path]) {
    return CACHED_TEMPLATE_FILES[file.path];
  }
  const templateFile = readTemplateFileSync(file);
  CACHED_TEMPLATE_FILES[file.path] = templateFile;
  return templateFile;
}

function buildPageTaskGenerator({ file, template: template }) {
  return async function buildPostTask() {
    const outputFile = path.join(OUTPUT_DIR, template.outputFilePath);

    let context = buildContext(null, template, file);

    let content = processTemplate(template.content, template.type, context);

    while (template.header.layout) {
      const layoutFile = resolveLayoutFile(template.header.layout);
      context = buildContext(content, template, file);

      template = readCachedTemplateFile(layoutFile);
      content = processTemplate(template.content, template.type, context);
      if (!template.header.layout) {
        break;
      }
    }

    await writeContentToFile(outputFile, content);
  };
}

function buildPostBuildingTasks() {
  const pages = ALL_FILES;

  return pages.map((page) => {
    const fn = buildPageTaskGenerator(page);

    Object.defineProperty(fn, 'name', {
      value: page.file.path,
      configurable: true,
    })

    return fn;
  });
}

function cleanTask() {
  return removeDirectory(OUTPUT_DIR);
}

const postsTask = parallel(buildPostBuildingTasks());

module.exports = {
  posts: postsTask,
  clean: cleanTask,
  default: series(cleanTask, postsTask)
};