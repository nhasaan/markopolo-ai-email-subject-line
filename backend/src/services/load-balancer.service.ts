import { AnalyzeSubjectRequest, AnalyzeSubjectResponse } from '../dtos/analyze-subject.dto';
import { AIService } from './ai.service';

interface LoadBalancerConfig {
  maxConcurrent: number;
  requestTimeout: number;
  retryAttempts: number;
  backoffMultiplier: number;
}

export class LoadBalancerService {
  private static instance: LoadBalancerService;
  private activeRequests = 0;
  private readonly config: LoadBalancerConfig;

  private constructor() {
    this.config = {
      maxConcurrent: 5, // Max 5 concurrent requests
      requestTimeout: 30000, // 30 seconds timeout
      retryAttempts: 2, // Retry failed requests twice
      backoffMultiplier: 1.5 // Exponential backoff
    };
  }

  static getInstance(): LoadBalancerService {
    if (!LoadBalancerService.instance) {
      LoadBalancerService.instance = new LoadBalancerService();
    }
    return LoadBalancerService.instance;
  }

  async processRequest(request: AnalyzeSubjectRequest): Promise<AnalyzeSubjectResponse> {
    // Check concurrency limit
    if (this.activeRequests >= this.config.maxConcurrent) {
      throw new Error('Service is at capacity. Please try again in a moment.');
    }

    this.activeRequests++;
    
    try {
      return await this.executeWithRetry(request);
    } finally {
      this.activeRequests--;
    }
  }

  private async executeWithRetry(request: AnalyzeSubjectRequest): Promise<AnalyzeSubjectResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        // Add exponential backoff for retries
        if (attempt > 0) {
          const backoffTime = Math.pow(this.config.backoffMultiplier, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }

        const aiService = AIService.getInstance();
        return await Promise.race([
          aiService.analyzeSubject(request),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), this.config.requestTimeout)
          )
        ]);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on certain errors
        if (this.isNonRetryableError(lastError)) {
          throw lastError;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === this.config.retryAttempts) {
          throw lastError;
        }
      }
    }
    
    throw lastError || new Error('All retry attempts failed');
  }

  private isNonRetryableError(error: Error): boolean {
    // Don't retry on validation errors, rate limits, or authentication issues
    if (error.message.includes('validation')) return true;
    if (error.message.includes('authentication')) return true;
    if (error.message.includes('authorization')) return true;
    if (error.message.includes('invalid input')) return true;
    return false;
  }

  getStatus(): {
    activeRequests: number;
    maxConcurrent: number;
    utilization: number;
    isHealthy: boolean;
  } {
    return {
      activeRequests: this.activeRequests,
      maxConcurrent: this.config.maxConcurrent,
      utilization: (this.activeRequests / this.config.maxConcurrent) * 100,
      isHealthy: this.activeRequests < this.config.maxConcurrent
    };
  }
}
