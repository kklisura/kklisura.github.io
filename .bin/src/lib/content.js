const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const { POSTS_DIR, DRAFTS_DIR, pages: pageConfigs, ROOT_DIR } = require('./config');
const renderMarkdown = require('./markdown');
const { toDisplayDate, toISODate } = require('./dates');

const POST_FILENAME_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/;

function slugify(rawSlug) {
  return rawSlug.replace(/-+/g, '-');
}

function titleFromSlug(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function readMarkdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'));
}

function loadPost(dir, filename, isDraft) {
  const match = filename.match(POST_FILENAME_RE);
  if (!match) return null;

  const [, year, month, day, rawSlug] = match;
  const slug = slugify(rawSlug);
  const raw = fs.readFileSync(path.join(dir, filename), 'utf8');
  const { data: frontMatter, content: body } = matter(raw);

  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const url = `/${year}/${month}/${day}/${slug}.html`;

  return {
    ...frontMatter,
    title: frontMatter.title || titleFromSlug(slug),
    tags: frontMatter.tags || [],
    date,
    dateDisplay: toDisplayDate(date),
    dateISO: toISODate(date),
    url,
    outputPath: path.join(year, month, day, `${slug}.html`),
    isDraft: Boolean(isDraft),
    content: renderMarkdown(body),
  };
}

function getPosts({ includeDrafts = false } = {}) {
  const posts = readMarkdownFiles(POSTS_DIR)
    .map((filename) => loadPost(POSTS_DIR, filename, false))
    .filter(Boolean);

  if (includeDrafts) {
    const drafts = readMarkdownFiles(DRAFTS_DIR)
      .map((filename) => loadPost(DRAFTS_DIR, filename, true))
      .filter(Boolean);
    posts.push(...drafts);
  }

  posts.sort((a, b) => b.date - a.date);
  return posts;
}

function getPages() {
  return pageConfigs.map(({ source, output }) => {
    const raw = fs.readFileSync(path.join(ROOT_DIR, source), 'utf8');
    const { data: frontMatter, content: body } = matter(raw);

    return {
      ...frontMatter,
      title: frontMatter.title || titleFromSlug(path.basename(source, '.md')),
      url: `/${output}`,
      outputPath: output,
      content: renderMarkdown(body),
    };
  });
}

module.exports = { getPosts, getPages };
