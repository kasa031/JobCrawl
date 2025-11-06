/**
 * Utility functions for robust selector matching with fallbacks
 */

/**
 * Try multiple selectors and return the first match
 * @param element - Parent element to search within
 * @param selectors - Array of selectors to try in order
 * @returns First matching element or null
 */
export function trySelectors(element: Element | Document, selectors: string[]): Element | null {
  for (const selector of selectors) {
    try {
      const found = element.querySelector(selector);
      if (found) {
        return found;
      }
    } catch {
      // Invalid selector, continue to next
    }
  }
  return null;
}

/**
 * Try multiple selectors and return all matches from the first selector that finds elements
 * @param element - Parent element to search within
 * @param selectors - Array of selectors to try in order
 * @returns NodeList of matching elements or empty NodeList
 */
export function trySelectorsAll(element: Element | Document, selectors: string[]): NodeListOf<Element> {
  for (const selector of selectors) {
    try {
      const found = element.querySelectorAll(selector);
      if (found.length > 0) {
        return found;
      }
    } catch {
      // Invalid selector, continue to next
    }
  }
  return document.querySelectorAll(':not(*)'); // Empty NodeList
}

/**
 * Extract text from element, trying multiple selectors
 * @param element - Parent element
 * @param selectors - Array of selectors to try
 * @param fallbackText - Optional fallback text if no selector matches
 * @returns Extracted text or fallback
 */
export function extractText(
  element: Element,
  selectors: string[],
  fallbackText: string = ''
): string {
  const found = trySelectors(element, selectors);
  if (found) {
    const text = found.textContent?.trim() || '';
    if (text) return text;
  }
  return fallbackText;
}

/**
 * Extract href from element, trying multiple selectors
 * @param element - Parent element
 * @param selectors - Array of selectors to try
 * @returns Extracted href or empty string
 */
export function extractHref(element: Element, selectors: string[]): string {
  const found = trySelectors(element, selectors);
  if (found && found instanceof HTMLAnchorElement) {
    return found.href || '';
  }
  // Also check if element itself is a link
  if (element instanceof HTMLAnchorElement) {
    return element.href || '';
  }
  return '';
}

/**
 * Common fallback selectors for job titles
 */
export const titleSelectors = [
  'h1',
  'h2',
  'h3',
  'h4',
  '[class*="title"]',
  '[class*="heading"]',
  '[data-testid*="title"]',
  'a[href*="job"]',
  'a[href*="stilling"]',
  '.job-title',
  '.ad-title',
  'strong',
  'b',
];

/**
 * Common fallback selectors for company names
 */
export const companySelectors = [
  '[class*="company"]',
  '[class*="employer"]',
  '[data-testid*="company"]',
  '[data-testid*="employer"]',
  '.company-name',
  '.employer-name',
  'span[class*="company"]',
  'div[class*="company"]',
];

/**
 * Common fallback selectors for locations
 */
export const locationSelectors = [
  '[class*="location"]',
  '[class*="place"]',
  '[data-testid*="location"]',
  '[data-testid*="place"]',
  '.location',
  '.place',
  'span[class*="location"]',
  'div[class*="location"]',
  '[aria-label*="sted"]',
  '[aria-label*="location"]',
];

/**
 * Common fallback selectors for job links
 */
export const linkSelectors = [
  'a[href*="job"]',
  'a[href*="stilling"]',
  'a[href*="ad"]',
  'a[href*="annonse"]',
  'a[href]',
  'a',
];

/**
 * Common fallback selectors for job descriptions
 */
export const descriptionSelectors = [
  '[class*="description"]',
  '[class*="summary"]',
  '[class*="text"]',
  '[data-testid*="description"]',
  '.description',
  '.summary',
  'p',
  'div[class*="content"]',
];

/**
 * Common fallback selectors for job listings/containers
 */
export const jobListSelectors = [
  'article[data-testid*="ad"]',
  'article[data-testid*="job"]',
  'article.ads__unit',
  'article[class*="ads"]',
  'article[class*="job"]',
  'article[class*="listing"]',
  'article',
  'div[class*="job"]',
  'div[class*="ad"]',
  'div[class*="listing"]',
  '[data-testid*="job"]',
  '[data-testid*="ad"]',
  '[class*="job-card"]',
  '[class*="job-item"]',
];

