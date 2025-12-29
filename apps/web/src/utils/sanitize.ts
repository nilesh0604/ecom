/**
 * Input Sanitization Utilities
 *
 * Interview Discussion Points:
 * - XSS prevention strategies
 * - When to sanitize vs when to escape
 * - Rich text handling (user-generated content)
 * - Server-side vs client-side sanitization
 * - Content Security Policy as defense in depth
 *
 * @module utils/sanitize
 */

// ============================================
// Types
// ============================================

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  allowedSchemes?: string[];
  stripEmpty?: boolean;
}

const DEFAULT_ALLOWED_TAGS = [
  'p',
  'br',
  'b',
  'i',
  'strong',
  'em',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'a',
  'span',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'code',
];

const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height'],
  '*': ['class', 'id'],
};

const DEFAULT_ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel'];

// ============================================
// Core Sanitization Functions
// ============================================

/**
 * Escape HTML entities to prevent XSS
 *
 * @example
 * ```tsx
 * escapeHtml('<script>alert("xss")</script>')
 * // Returns: '&lt;script&gt;alert("xss")&lt;/script&gt;'
 * ```
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
  };

  return str.replace(
    /&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g,
    (entity) => htmlUnescapes[entity] || entity
  );
}

/**
 * Strip all HTML tags from a string
 *
 * @example
 * ```tsx
 * stripHtml('<p>Hello <b>World</b></p>')
 * // Returns: 'Hello World'
 * ```
 */
export function stripHtml(str: string): string {
  // First decode HTML entities
  const decoded = str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

  // Remove all HTML tags
  return decoded.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize URL to prevent javascript: and data: XSS
 *
 * @example
 * ```tsx
 * sanitizeUrl('javascript:alert("xss")')
 * // Returns: ''
 *
 * sanitizeUrl('https://example.com')
 * // Returns: 'https://example.com'
 * ```
 */
export function sanitizeUrl(
  url: string,
  allowedSchemes = DEFAULT_ALLOWED_SCHEMES
): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim().toLowerCase();

  // Check for dangerous schemes
  const dangerousPatterns = [
    /^javascript:/i,
    /^data:/i,
    /^vbscript:/i,
    /^file:/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(trimmed)) {
      console.warn(`Blocked dangerous URL scheme: ${url}`);
      return '';
    }
  }

  // Check if scheme is allowed
  const schemeMatch = trimmed.match(/^([a-z][a-z0-9+.-]*):\/\//);
  if (schemeMatch) {
    const scheme = schemeMatch[1];
    if (!allowedSchemes.includes(scheme)) {
      console.warn(`Blocked URL with disallowed scheme: ${scheme}`);
      return '';
    }
  }

  return url;
}

/**
 * Sanitize HTML content allowing only safe tags and attributes
 * This is a lightweight sanitizer - for production, consider DOMPurify
 *
 * @example
 * ```tsx
 * sanitizeHtml('<p onclick="alert(1)">Hello</p><script>bad</script>')
 * // Returns: '<p>Hello</p>'
 * ```
 */
export function sanitizeHtml(
  html: string,
  options: SanitizeOptions = {}
): string {
  const {
    allowedTags = DEFAULT_ALLOWED_TAGS,
    allowedAttributes = DEFAULT_ALLOWED_ATTRIBUTES,
    allowedSchemes = DEFAULT_ALLOWED_SCHEMES,
    stripEmpty = false,
  } = options;

  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary DOM element to parse the HTML
  const template = document.createElement('template');
  template.innerHTML = html;

  function sanitizeNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // Remove disallowed tags
      if (!allowedTags.includes(tagName)) {
        element.remove();
        return;
      }

      // Get allowed attributes for this tag
      const tagAllowedAttrs = [
        ...(allowedAttributes[tagName] || []),
        ...(allowedAttributes['*'] || []),
      ];

      // Remove disallowed attributes
      const attrs = Array.from(element.attributes);
      for (const attr of attrs) {
        const attrName = attr.name.toLowerCase();

        // Always remove event handlers
        if (attrName.startsWith('on')) {
          element.removeAttribute(attr.name);
          continue;
        }

        // Remove disallowed attributes
        if (!tagAllowedAttrs.includes(attrName)) {
          element.removeAttribute(attr.name);
          continue;
        }

        // Sanitize URLs in href and src attributes
        if (attrName === 'href' || attrName === 'src') {
          const sanitized = sanitizeUrl(attr.value, allowedSchemes);
          if (sanitized) {
            element.setAttribute(attr.name, sanitized);
          } else {
            element.removeAttribute(attr.name);
          }
        }
      }

      // Add rel="noopener noreferrer" to external links
      if (tagName === 'a' && element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }

      // Remove empty elements if configured
      if (stripEmpty && !element.textContent?.trim() && element.children.length === 0) {
        element.remove();
        return;
      }
    }

    // Recursively sanitize child nodes
    const children = Array.from(node.childNodes);
    for (const child of children) {
      sanitizeNode(child);
    }
  }

  sanitizeNode(template.content);

  return template.innerHTML;
}

// ============================================
// Input Validation
// ============================================

/**
 * Validate and sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Remove any HTML and trim
  const cleaned = stripHtml(email).trim().toLowerCase();

  // Basic email pattern validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * Sanitize and validate phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-numeric characters except + at the start
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

/**
 * Sanitize text input (for names, addresses, etc.)
 */
export function sanitizeText(text: string, maxLength = 500): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Strip HTML, normalize whitespace, and limit length
  return stripHtml(text)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(
  value: string | number,
  options: { min?: number; max?: number; decimals?: number } = {}
): number | null {
  const { min, max, decimals = 2 } = options;

  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return null;
  }

  let result = num;

  if (min !== undefined && result < min) {
    result = min;
  }

  if (max !== undefined && result > max) {
    result = max;
  }

  // Round to specified decimal places
  const multiplier = Math.pow(10, decimals);
  result = Math.round(result * multiplier) / multiplier;

  return result;
}

// ============================================
// React Integration
// ============================================

import { useMemo } from 'react';

/**
 * Hook to sanitize HTML content for safe rendering
 *
 * @example
 * ```tsx
 * const { sanitizedHtml, rawText } = useSanitizedHtml(userContent);
 *
 * return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
 * ```
 */
export function useSanitizedHtml(
  html: string,
  options?: SanitizeOptions
): {
  sanitizedHtml: string;
  rawText: string;
} {
  return useMemo(() => {
    return {
      sanitizedHtml: sanitizeHtml(html, options),
      rawText: stripHtml(html),
    };
  }, [html, options]);
}

// ============================================
// Safe Rendering Component
// ============================================

import React from 'react';

interface SafeHtmlProps {
  html: string;
  options?: SanitizeOptions;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * Component for safely rendering user-generated HTML
 *
 * @example
 * ```tsx
 * <SafeHtml
 *   html={userContent}
 *   as="article"
 *   className="prose"
 * />
 * ```
 */
export function SafeHtml({
  html,
  options,
  as: Component = 'div',
  className,
}: SafeHtmlProps): React.ReactElement {
  const { sanitizedHtml } = useSanitizedHtml(html, options);

  return React.createElement(Component, {
    className,
    dangerouslySetInnerHTML: { __html: sanitizedHtml },
  });
}

// ============================================
// Server-Side Sanitization Note
// ============================================

/**
 * IMPORTANT: Client-side sanitization is a defense-in-depth measure.
 * Always sanitize on the server as well!
 *
 * Recommended server-side libraries:
 * - Node.js: DOMPurify (with jsdom), sanitize-html
 * - Python: bleach
 * - Go: bluemonday
 *
 * Example server-side sanitization (Node.js):
 *
 * ```javascript
 * import createDOMPurify from 'dompurify';
 * import { JSDOM } from 'jsdom';
 *
 * const window = new JSDOM('').window;
 * const DOMPurify = createDOMPurify(window);
 *
 * export function sanitizeOnServer(html) {
 *   return DOMPurify.sanitize(html, {
 *     ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a'],
 *     ALLOWED_ATTR: ['href'],
 *   });
 * }
 * ```
 */
