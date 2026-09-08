function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlEntry(siteUrl, loc, lastmod) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${escapeXml(siteUrl + loc)}</loc>${lastmodTag}\n  </url>`;
}

function buildSitemap({ siteUrl, posts, pages }) {
  const publishedPosts = posts.filter((post) => !post.isDraft);
  const latestPostDate = publishedPosts[0] ? publishedPosts[0].dateISO : undefined;

  const entries = [
    urlEntry(siteUrl, '/', latestPostDate),
    ...pages.map((page) => urlEntry(siteUrl, page.url)),
    ...publishedPosts.map((post) => urlEntry(siteUrl, post.url, post.dateISO)),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}

module.exports = { buildSitemap };
