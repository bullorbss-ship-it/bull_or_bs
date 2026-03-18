import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/orange', '/api/'],
      },
    ],
    sitemap: [
      'https://bullorbs.com/sitemap.xml',
      'https://bullorbs.com/news-sitemap.xml',
    ],
  };
}
