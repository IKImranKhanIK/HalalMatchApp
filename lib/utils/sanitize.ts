/**
 * Input Sanitization Utilities
 * Sanitize user input to prevent XSS and injection attacks
 */

/**
 * Sanitize HTML content to prevent XSS
 * Server-side implementation (no DOMPurify needed)
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof dirty !== 'string') return '';

  // Remove all HTML tags
  return dirty.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize text input (removes HTML and dangerous characters)
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';

  // Remove HTML tags
  let clean = sanitizeHtml(input);

  // Trim whitespace
  clean = clean.trim();

  // Normalize whitespace
  clean = clean.replace(/\s+/g, ' ');

  return clean;
}

/**
 * Sanitize email (basic validation and normalization)
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';

  return email.toLowerCase().trim();
}

/**
 * Sanitize phone number (remove non-numeric characters except + and -)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';

  return phone.replace(/[^\d+\-() ]/g, '').trim();
}

/**
 * Sanitize participant data
 */
export function sanitizeParticipantData(data: {
  full_name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}) {
  return {
    ...data,
    full_name: data.full_name ? sanitizeText(data.full_name) : data.full_name,
    email: data.email ? sanitizeEmail(data.email) : data.email,
    phone: data.phone ? sanitizePhone(data.phone) : data.phone,
  };
}

/**
 * Escape special characters for safe display
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}
