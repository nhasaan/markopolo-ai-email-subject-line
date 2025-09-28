import { config } from '../config';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimitService {
  private static instance: RateLimitService;
  private store = new Map<string, RateLimitEntry>();

  private constructor() {}

  static getInstance(): RateLimitService {
    if (!RateLimitService.instance) {
      RateLimitService.instance = new RateLimitService();
    }
    return RateLimitService.instance;
  }

  isAllowed(ip: string): boolean {
    const now = Date.now();
    const entry = this.store.get(ip);
    
    if (!entry || now > entry.resetTime) {
      this.store.set(ip, {
        count: 1,
        resetTime: now + config.rateLimitWindowMs
      });
      return true;
    }
    
    if (entry.count >= config.rateLimitRequests) {
      return false;
    }
    
    entry.count++;
    return true;
  }

  getRemainingRequests(ip: string): number {
    const entry = this.store.get(ip);
    if (!entry) return config.rateLimitRequests;
    
    const now = Date.now();
    if (now > entry.resetTime) {
      return config.rateLimitRequests;
    }
    
    return Math.max(0, config.rateLimitRequests - entry.count);
  }

  getResetTime(ip: string): number {
    const entry = this.store.get(ip);
    if (!entry) return Date.now() + config.rateLimitWindowMs;
    
    return entry.resetTime;
  }

  // Clean up expired entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(ip);
      }
    }
  }
}
