import { AnalyzeSubjectRequest } from '../dtos/analyze-subject.dto';

interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  lastReset: Date;
}

export class PerformanceService {
  private static instance: PerformanceService;
  private metrics: PerformanceMetrics = {
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
    lastReset: new Date()
  };
  
  private responseTimes: number[] = [];
  private errorCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  private constructor() {}

  static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  recordRequest(responseTime: number, fromCache: boolean = false, isError: boolean = false): void {
    this.metrics.requestCount++;
    this.responseTimes.push(responseTime);
    
    if (isError) {
      this.errorCount++;
    }
    
    if (fromCache) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
    
    // Keep only last 1000 response times for rolling average
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }
    
    this.updateMetrics();
  }

  private updateMetrics(): void {
    // Calculate average response time
    if (this.responseTimes.length > 0) {
      this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }
    
    // Calculate error rate
    this.metrics.errorRate = this.metrics.requestCount > 0 ? (this.errorCount / this.metrics.requestCount) * 100 : 0;
    
    // Calculate cache hit rate
    const totalCacheRequests = this.cacheHits + this.cacheMisses;
    this.metrics.cacheHitRate = totalCacheRequests > 0 ? (this.cacheHits / totalCacheRequests) * 100 : 0;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      requestCount: 0,
      averageResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      lastReset: new Date()
    };
    this.responseTimes = [];
    this.errorCount = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  // Performance monitoring for high-volume scenarios
  shouldThrottle(): boolean {
    // Throttle if average response time > 2 seconds
    return this.metrics.averageResponseTime > 2000;
  }

  getHealthStatus(): 'healthy' | 'degraded' | 'critical' {
    if (this.metrics.errorRate > 10 || this.metrics.averageResponseTime > 5000) {
      return 'critical';
    }
    if (this.metrics.errorRate > 5 || this.metrics.averageResponseTime > 3000) {
      return 'degraded';
    }
    return 'healthy';
  }
}
