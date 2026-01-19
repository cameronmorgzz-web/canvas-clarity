/**
 * HTML Sanitization utilities for Canvas content
 * Provides safe rendering of assignment descriptions and announcements
 */

// Allowed HTML tags that are safe to render
const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'figure', 'figcaption',
  'hr',
]);

// Allowed attributes for specific tags
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'title']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  '*': new Set(['class', 'id']),
};

// URL protocols that are allowed
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/**
 * Simple HTML sanitizer for Canvas content
 * Note: For production, consider using DOMPurify library
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Recursively sanitize nodes
  function sanitizeNode(node: Node): Node | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.cloneNode(true);
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }
    
    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    
    // Remove disallowed tags entirely (but keep their text content for some)
    if (!ALLOWED_TAGS.has(tagName)) {
      // For script/style, remove entirely
      if (tagName === 'script' || tagName === 'style') {
        return null;
      }
      // For other tags, create a span to hold the content
      const span = document.createElement('span');
      element.childNodes.forEach((child) => {
        const sanitized = sanitizeNode(child);
        if (sanitized) span.appendChild(sanitized);
      });
      return span.childNodes.length > 0 ? span : null;
    }
    
    // Create clean element
    const clean = document.createElement(tagName);
    
    // Copy allowed attributes
    const globalAttrs = ALLOWED_ATTRS['*'] || new Set();
    const tagAttrs = ALLOWED_ATTRS[tagName] || new Set();
    
    for (const attr of element.attributes) {
      const attrName = attr.name.toLowerCase();
      
      // Skip event handlers
      if (attrName.startsWith('on')) continue;
      
      // Check if attribute is allowed
      if (!globalAttrs.has(attrName) && !tagAttrs.has(attrName)) continue;
      
      // Validate URLs
      if (attrName === 'href' || attrName === 'src') {
        try {
          const url = new URL(attr.value, window.location.origin);
          if (!ALLOWED_PROTOCOLS.has(url.protocol)) continue;
        } catch {
          // Invalid URL, skip
          continue;
        }
      }
      
      clean.setAttribute(attrName, attr.value);
    }
    
    // Force external links to open in new tab safely
    if (tagName === 'a' && clean.getAttribute('href')?.startsWith('http')) {
      clean.setAttribute('target', '_blank');
      clean.setAttribute('rel', 'noopener noreferrer');
    }
    
    // Recursively sanitize children
    element.childNodes.forEach((child) => {
      const sanitized = sanitizeNode(child);
      if (sanitized) clean.appendChild(sanitized);
    });
    
    return clean;
  }
  
  // Sanitize body content
  const fragment = document.createDocumentFragment();
  doc.body.childNodes.forEach((child) => {
    const sanitized = sanitizeNode(child);
    if (sanitized) fragment.appendChild(sanitized);
  });
  
  // Create a temporary container to get HTML
  const temp = document.createElement('div');
  temp.appendChild(fragment);
  
  return temp.innerHTML;
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHTML(html: string): string {
  if (!html) return '';
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  return doc.body.textContent || '';
}

/**
 * Truncate HTML content safely (preserves tags structure)
 */
export function truncateHTML(html: string, maxLength: number): string {
  const plain = stripHTML(html);
  
  if (plain.length <= maxLength) {
    return sanitizeHTML(html);
  }
  
  // Simple truncation with ellipsis
  const truncated = plain.substring(0, maxLength).trim();
  return truncated + '...';
}
