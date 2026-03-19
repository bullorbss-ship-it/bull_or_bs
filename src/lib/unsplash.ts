/**
 * Unsplash API helper — fetches relevant stock photos for article hero images.
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
  blurHash?: string;
}

/** Map article context to a good Unsplash search query */
export function getSearchQuery(opts: {
  ticker?: string;
  type: 'roast' | 'pick' | 'take';
  title: string;
  category?: string;
}): string {
  const { ticker, type, title, category } = opts;
  const titleLower = title.toLowerCase();

  // Category-based queries for takes
  if (category) {
    const categoryMap: Record<string, string> = {
      'geopolitics': 'global politics economy',
      'commodities': 'commodities trading oil gold',
      'tech': 'technology stocks silicon valley',
      'earnings': 'stock market earnings report',
      'macro': 'economy federal reserve finance',
      'crypto': 'cryptocurrency bitcoin digital',
      'energy': 'energy oil gas renewable',
      'm&a': 'corporate merger acquisition business',
      'banking': 'banking finance wall street',
      'healthcare': 'healthcare pharmaceutical',
      'real estate': 'real estate property market',
      'automotive': 'automotive cars manufacturing',
      'ai': 'artificial intelligence technology',
      'semiconductor': 'semiconductor chip technology',
      'defense': 'defense military aerospace',
      'retail': 'retail shopping consumer',
      'airlines': 'airlines aviation airport',
    };
    const mapped = Object.entries(categoryMap).find(([key]) =>
      category.toLowerCase().includes(key)
    );
    if (mapped) return mapped[1];
  }

  // Keyword detection from title
  const keywordMap: [RegExp, string][] = [
    [/nvidia|gpu|chip|semiconductor/i, 'semiconductor chip technology'],
    [/apple|iphone/i, 'apple technology'],
    [/tesla|ev|electric vehicle/i, 'electric vehicle tesla'],
    [/oil|petroleum|crude|energy/i, 'oil energy petroleum'],
    [/gold|mining|commodit/i, 'gold mining commodities'],
    [/bank|financ/i, 'banking finance wall street'],
    [/pharma|drug|health/i, 'pharmaceutical healthcare'],
    [/ai|artificial intelligence|machine learning/i, 'artificial intelligence technology'],
    [/crypto|bitcoin|blockchain/i, 'cryptocurrency bitcoin'],
    [/real estate|reit|property/i, 'real estate property'],
    [/dividend|income|yield/i, 'investment dividend income'],
    [/etf|index fund|portfolio/i, 'investment portfolio diversification'],
    [/defense|military|weapon/i, 'defense military aerospace'],
    [/airline|aviation|flight/i, 'airlines aviation airport'],
    [/retail|consumer|shop/i, 'retail shopping consumer'],
    [/tariff|trade war|geopolit/i, 'global trade politics economy'],
    [/meta|facebook|social media/i, 'social media technology'],
    [/google|alphabet|search/i, 'google technology search'],
    [/amazon|ecommerce/i, 'ecommerce warehouse logistics'],
    [/microsoft|cloud|azure/i, 'cloud computing technology'],
  ];

  for (const [pattern, query] of keywordMap) {
    if (pattern.test(titleLower) || (ticker && pattern.test(ticker))) {
      return query;
    }
  }

  // Default fallbacks by type
  if (type === 'roast') return 'stock market analysis finance';
  if (type === 'pick') return 'stock market trading investment';
  return 'financial news economy market';
}

/** Fetch a relevant photo from Unsplash. Returns null if API key missing or request fails. */
export async function fetchUnsplashPhoto(query: string): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log('[Unsplash] No UNSPLASH_ACCESS_KEY — skipping image fetch');
    return null;
  }

  try {
    const url = `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&orientation=landscape&per_page=5&content_filter=high`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.log(`[Unsplash] API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (!data.results?.length) {
      console.log(`[Unsplash] No results for query: ${query}`);
      return null;
    }

    // Pick a random photo from top 5 for variety
    const photo = data.results[Math.floor(Math.random() * Math.min(5, data.results.length))];

    // Trigger Unsplash download tracking (required by API guidelines)
    if (photo.links?.download_location) {
      fetch(`${photo.links.download_location}?client_id=${accessKey}`, { signal: AbortSignal.timeout(3000) }).catch(() => {});
    }

    return {
      url: photo.urls?.regular || photo.urls?.full,
      thumbUrl: photo.urls?.small || photo.urls?.thumb,
      photographer: photo.user?.name || 'Unknown',
      photographerUrl: photo.user?.links?.html || 'https://unsplash.com',
      unsplashUrl: photo.links?.html || 'https://unsplash.com',
      blurHash: photo.blur_hash,
    };
  } catch (err) {
    console.log('[Unsplash] Fetch failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/** Convenience: search + fetch in one call */
export async function getArticleImage(opts: {
  ticker?: string;
  type: 'roast' | 'pick' | 'take';
  title: string;
  category?: string;
}): Promise<UnsplashPhoto | null> {
  const query = getSearchQuery(opts);
  return fetchUnsplashPhoto(query);
}
