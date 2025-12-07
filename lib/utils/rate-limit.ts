/**
 * Rate Limiting Utility
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetTime < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Block duration in seconds after limit is exceeded
   */
  blockDurationSeconds?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  blocked?: boolean;
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;
  const entry = rateLimitMap.get(identifier);

  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.blockedUntil,
      blocked: true,
    };
  }

  // Create new entry if doesn't exist or window expired
  if (!entry || entry.resetTime < now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + windowMs,
    };
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    // Block if configured
    if (config.blockDurationSeconds) {
      entry.blockedUntil = now + (config.blockDurationSeconds * 1000);
    }

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
      blocked: !!config.blockDurationSeconds,
    };
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Rate limit presets for common use cases
 */
export const RateLimitPresets = {
  // Login endpoints: 5 attempts per 15 minutes, block for 1 hour
  LOGIN: {
    maxRequests: 5,
    windowSeconds: 15 * 60,
    blockDurationSeconds: 60 * 60,
  },

  // Registration: 50 per hour
  REGISTRATION: {
    maxRequests: 50,
    windowSeconds: 60 * 60,
    blockDurationSeconds: 60 * 60,
  },

  // API calls: 100 per minute
  API: {
    maxRequests: 100,
    windowSeconds: 60,
  },

  // Strict API: 30 per minute
  STRICT_API: {
    maxRequests: 30,
    windowSeconds: 60,
  },
};
