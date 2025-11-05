/**
 * Cloudflare Pages Middleware
 * Transforms CSS link tags to load asynchronously (non-blocking)
 *
 * Strategy:
 * - Critical CSS is inlined by Next.js (via experimental.optimizeCss)
 * - Remaining CSS links are made async using media="print" trick
 * - This eliminates render-blocking CSS and improves FCP
 */

class AsyncCSSTransformer {
  element(element: Element) {
    // Only transform stylesheet links (not preload, icon, etc)
    const rel = element.getAttribute('rel');
    const href = element.getAttribute('href');

    if (rel === 'stylesheet' && href?.includes('.css')) {
      // Add media="print" to make CSS load with low priority
      element.setAttribute('media', 'print');

      // Add onload to switch media to 'all' once loaded
      element.setAttribute('onload', "this.media='all'");

      // Add noscript fallback for users without JavaScript
      element.after(
        `<noscript><link rel="stylesheet" href="${href}"></noscript>`,
        { html: true }
      );
    }
  }
}

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  // Only transform HTML responses
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('text/html')) {
    return response;
  }

  // Use HTMLRewriter to transform CSS links
  return new HTMLRewriter()
    .on('link[rel="stylesheet"]', new AsyncCSSTransformer())
    .transform(response);
};
