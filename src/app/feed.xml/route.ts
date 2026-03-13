import { getAllArticles } from '@/lib/content';
import { siteConfig } from '@/config/site';

export async function GET() {
  const articles = getAllArticles();

  const items = articles
    .slice(0, 20)
    .map(
      a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteConfig.url}/article/${a.slug}</link>
      <guid>${siteConfig.url}/article/${a.slug}</guid>
      <pubDate>${new Date(a.date).toUTCString()}</pubDate>
      <description><![CDATA[${a.description}]]></description>
      <category>${a.type === 'roast' ? 'The Roast' : a.type === 'take' ? 'News' : 'AI Pick'}</category>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Bull Or BS</title>
    <link>${siteConfig.url}</link>
    <description>AI-driven stock analysis that shows its work</description>
    <language>en-ca</language>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
