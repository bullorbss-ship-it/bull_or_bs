/** Request an appropriately-sized image from Unsplash's CDN instead of the
 * full-resolution original. No-op for non-Unsplash URLs without query support. */
export function sizedImageUrl(url: string, width: number): string {
  if (!url.includes('images.unsplash.com')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}w=${width}&q=75&auto=format`;
}
