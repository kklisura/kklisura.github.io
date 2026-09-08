const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: __dirname,
  encoding: 'utf8',
}).trim();
const BIN_DIR = path.join(ROOT_DIR, '.bin');

module.exports = {
  ROOT_DIR,
  POSTS_DIR: path.join(ROOT_DIR, 'posts'),
  DRAFTS_DIR: path.join(ROOT_DIR, 'drafts'),
  OUTPUT_DIR: path.join(ROOT_DIR, '_site'),
  TEMPLATES_DIR: path.join(BIN_DIR, 'templates'),
  PARTIALS_DIR: path.join(BIN_DIR, 'templates', 'partials'),
  ASSETS_DIR: path.join(BIN_DIR, 'templates', 'assets'),

  site: {
    title: 'Kenan Klisura',
    description: "Kenan Klisura's personal blog",
    url: 'https://kklisura.com',
    author: 'Kenan Klisura',
    copyright: 'Copyright 2024-2026 by Kenan Klisura. Any and all opinions expressed here are my own and not representative of any of my employers, past, future, and/or present.',
  },

  nav: [
    { title: 'Posts', url: '/' },
    { title: 'Resume', url: '/resume.html' },
    { title: 'Links', url: '/links.html' },
    { title: 'About', url: '/about.html' },
  ],

  // Top-level markdown pages: source file (repo root) -> output file (site root)
  pages: [
    { source: 'about.md', output: 'about.html' },
    { source: 'resume.md', output: 'resume.html' },
    { source: 'links.md', output: 'links.html' },
  ],
};
