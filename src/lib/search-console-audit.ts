export interface SearchConsoleIndexRow {
  URL: string;
  'Last crawled': string;
  Status: string;
}

export interface SearchConsoleAudit {
  total: number;
  byType: Record<string, number>;
  wwwUrls: number;
  duplicateCanonicalPaths: string[];
  failedUrls: string[];
  actions: {
    noindexReview: string[];
    canonicalReview: string[];
    transientReview: string[];
  };
}

export function auditSearchConsoleRows(rows: SearchConsoleIndexRow[]): SearchConsoleAudit {
  const paths = new Map<string, number>();
  const byType: Record<string, number> = {};
  const actions = {
    noindexReview: [] as string[],
    canonicalReview: [] as string[],
    transientReview: [] as string[],
  };
  let wwwUrls = 0;
  const failedUrls: string[] = [];

  for (const row of rows) {
    let url: URL;
    try {
      url = new URL(row.URL);
    } catch {
      continue;
    }
    const first = url.pathname.split('/').filter(Boolean)[0] || 'home';
    byType[first] = (byType[first] || 0) + 1;
    paths.set(url.pathname, (paths.get(url.pathname) || 0) + 1);
    if (url.hostname.startsWith('www.')) {
      wwwUrls++;
      actions.canonicalReview.push(row.URL);
    }
    if (row.Status.toLowerCase() === 'failed') {
      failedUrls.push(row.URL);
      actions.transientReview.push(row.URL);
    }
    if (first === 'stock' || first === 'article') {
      actions.noindexReview.push(row.URL);
    }
  }

  return {
    total: rows.length,
    byType,
    wwwUrls,
    duplicateCanonicalPaths: [...paths.entries()]
      .filter(([, count]) => count > 1)
      .map(([path]) => path),
    failedUrls,
    actions,
  };
}
