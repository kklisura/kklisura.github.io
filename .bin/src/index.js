#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { OUTPUT_DIR, ASSETS_DIR, ROOT_DIR, site } = require('./lib/config');
const { getPosts, getPages } = require('./lib/content');
const { renderPage } = require('./lib/render');
const { buildSitemap } = require('./lib/sitemap');
const { buildRobots } = require('./lib/robots');
const { cleanDir, writeFile, copyDir } = require('./lib/fsutils');

function build() {
  const includeDrafts = process.argv.includes('--drafts');

  cleanDir(OUTPUT_DIR);
  copyDir(ASSETS_DIR, path.join(OUTPUT_DIR, 'assets'));

  const cname = path.join(ROOT_DIR, 'CNAME');
  if (fs.existsSync(cname)) {
    fs.copyFileSync(cname, path.join(OUTPUT_DIR, 'CNAME'));
  }

  const posts = getPosts({ includeDrafts });
  const pages = getPages();

  writeFile(
    path.join(OUTPUT_DIR, 'index.html'),
    renderPage('index', {
      title: site.title,
      activeUrl: '/',
      posts,
    })
  );

  for (const post of posts) {
    writeFile(
      path.join(OUTPUT_DIR, post.outputPath),
      renderPage('post', {
        title: post.title,
        activeUrl: '/',
        post,
      })
    );
  }

  for (const page of pages) {
    writeFile(
      path.join(OUTPUT_DIR, page.outputPath),
      renderPage('page', {
        title: page.title,
        activeUrl: page.url,
        page,
      })
    );
  }

  writeFile(
    path.join(OUTPUT_DIR, '404.html'),
    renderPage('404', {
      title: 'Page Not Found',
      activeUrl: null,
    })
  );

  writeFile(
    path.join(OUTPUT_DIR, 'sitemap.xml'),
    buildSitemap({ siteUrl: site.url, posts, pages })
  );

  writeFile(
    path.join(OUTPUT_DIR, 'robots.txt'),
    buildRobots({ siteUrl: site.url })
  );

  const draftCount = posts.filter((p) => p.isDraft).length;
  console.log(
    `Built ${posts.length} post(s)${
      draftCount ? ` (${draftCount} draft)` : ''
    } and ${pages.length} page(s) into ${path.relative(ROOT_DIR, OUTPUT_DIR)}/`
  );
}

build();
