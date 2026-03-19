/**
 * Unsplash API helper — fetches relevant stock photos for article hero + inline images.
 * Free tier: 50 requests/hour. Requires UNSPLASH_ACCESS_KEY env var.
 * Attribution is required per Unsplash ToS.
 */

const UNSPLASH_API = 'https://api.unsplash.com';

export interface UnsplashPhoto {
  url: string;           // Regular size (1080w) — used for hero + OG
  thumbUrl: string;      // Small thumbnail (400w)
  photographer: string;
  photographerUrl: string;
  unsplashUrl: string;   // Link back to Unsplash (required by ToS)
}

/** Fallback: map article context to an Unsplash search query when AI terms aren't available */
function getFallbackQuery(opts: {
  ticker?: string;
  type: 'roast' | 'pick' | 'take';
  title: string;
  category?: string;
}): string {
  const { type, title, category } = opts;
  const titleLower = title.toLowerCase();

  if (category) {
    const categoryMap: Record<string, string> = {
      'geopolitics': 'global politics economy',
      'commodities': 'commodities trading oil gold',
      'tech': 'technology stocks silicon valley',
      'earnings': 'stock market earnings report',
      'macro': 'economy federal reserve finance',
      'energy': 'energy oil gas renewable',
      'semiconductor': 'semiconductor chip technology',
      'defense': 'defense military aerospace',
      'airlines': 'airlines aviation airport',
    };
    const mapped = Object.entries(categoryMap).find(([key]) =>
      category.toLowerCase().includes(key)
    );
    if (mapped) return mapped[1];
  }

  const keywordMap: [RegExp, string][] = [
    [/nvidia|gpu|chip|semiconductor/i, 'semiconductor factory clean room'],
    [/tesla|ev|electric vehicle/i, 'electric vehicle charging station'],
    [/oil|petroleum|crude|energy/i, 'oil refinery industrial'],
    [/gold|mining/i, 'gold bars vault'],
    [/bank|financ/i, 'wall street banking district'],
    [/pharma|drug|health/i, 'pharmaceutical laboratory research'],
    [/ai|artificial intelligence/i, 'artificial intelligence server room'],
    [/crypto|bitcoin/i, 'cryptocurrency digital currency'],
    [/meta|facebook|social media/i, 'social media smartphone network'],
    [/google|alphabet/i, 'search engine technology office'],
    [/amazon|ecommerce/i, 'ecommerce warehouse logistics'],
    [/tariff|trade war|geopolit/i, 'shipping containers global trade'],
    [/airline|aviation/i, 'airplane airport commercial aviation'],
  ];

  for (const [pattern, query] of keywordMap) {
    if (pattern.test(titleLower)) return query;
  }

  if (type === 'roast') return 'stock market trading floor';
  if (type === 'pick') return 'stock market investment chart';
  return 'financial news newspaper economy';
}

/** Fetch photos from Unsplash for a given query. Returns up to `count` unique photos. */
async function fetchPhotos(query: string, count: number): Promise<UnsplashPhoto[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log('[Unsplash] No UNSPLASH_ACCESS_KEY — skipping image fetch');
    return [];
  }

  try {
    const url = `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=${Math.min(count + 5, 15)}&content_filter=high`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.log(`[Unsplash] API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    if (!data.results?.length) {
      console.log(`[Unsplash] No results for query: ${query}`);
      return [];
    }

    // Shuffle results for variety, then take what we need
    const shuffled = data.results.sort(() => Math.random() - 0.5);
    const photos: UnsplashPhoto[] = [];

    for (const photo of shuffled) {
      if (photos.length >= count) break;

      // Trigger Unsplash download tracking (required by API guidelines)
      if (photo.links?.download_location) {
        fetch(`${photo.links.download_location}?client_id=${accessKey}`, { signal: AbortSignal.timeout(3000) }).catch(() => {});
      }

      photos.push({
        url: photo.urls?.regular || photo.urls?.full,
        thumbUrl: photo.urls?.small || photo.urls?.thumb,
        photographer: photo.user?.name || 'Unknown',
        photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
        unsplashUrl: photo.links?.html || 'https://unsplash.com',
      });
    }

    return photos;
  } catch (err) {
    console.log('[Unsplash] Fetch failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Fetch article images: 1 hero + 2 inline.
 * Uses AI-suggested search terms when available, falls back to keyword mapping.
 * Makes 1-2 API calls (one per unique search term used).
 */
export async function getArticleImages(opts: {
  ticker?: string;
  type: 'roast' | 'pick' | 'take';
  title: string;
  category?: string;
  imageSearchTerms?: string[];
}): Promise<{ hero: UnsplashPhoto | null; inline: UnsplashPhoto[] }> {
  const { imageSearchTerms } = opts;

  // Use AI-suggested terms if available, otherwise fallback
  const queries = [
    imageSearchTerms?.[0],
    imageSearchTerms?.[1],
    imageSearchTerms?.[2],
    getFallbackQuery(opts),
  ].filter(Boolean) as string[];

  // Fetch hero image with primary query
  const heroPhotos = await fetchPhotos(queries[0], 1);
  const hero = heroPhotos[0] || null;

  // Fetch inline images — try each remaining query until we have 2
  const inline: UnsplashPhoto[] = [];
  const usedUrls = new Set(hero ? [hero.url] : []);

  for (let i = 1; i < queries.length && inline.length < 2; i++) {
    const photos = await fetchPhotos(queries[i], 3);
    for (const p of photos) {
      if (inline.length >= 2) break;
      if (!usedUrls.has(p.url)) {
        inline.push(p);
        usedUrls.add(p.url);
      }
    }
  }

  return { hero, inline };
}

/** Legacy single-image convenience function */
export async function getArticleImage(opts: {
  ticker?: string;
  type: 'roast' | 'pick' | 'take';
  title: string;
  category?: string;
  imageSearchTerms?: string[];
}): Promise<UnsplashPhoto | null> {
  const primaryQuery = opts.imageSearchTerms?.[0] || getFallbackQuery(opts);
  const photos = await fetchPhotos(primaryQuery, 1);
  return photos[0] || null;
}
