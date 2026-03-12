'use client';

import { useEffect } from 'react';
import { trackScrollDepth } from '@/lib/tracking';

export default function ScrollTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const cleanup = trackScrollDepth(slug);
    return cleanup;
  }, [slug]);

  return null;
}
