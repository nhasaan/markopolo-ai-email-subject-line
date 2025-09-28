import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { config } from '../config';
import { RateLimitService } from '../services/rate-limit.service';
import { CacheService } from '../services/cache.service';
import { PerformanceService } from '../services/performance.service';
import { LoadBalancerService } from '../services/load-balancer.service';
import { AnalyzeSubjectRequestSchema, AnalyzeSubjectRequest } from '../dtos/analyze-subject.dto';

export class Server {
  private fastify: FastifyInstance;
  private rateLimitService: RateLimitService;
  private cacheService: CacheService;
  private performanceService: PerformanceService;
  private loadBalancerService: LoadBalancerService;

  constructor() {
    this.fastify = Fastify({
      logger: {
        level: config.nodeEnv === 'production' ? 'warn' : 'info'
      }
    });
    
    this.rateLimitService = RateLimitService.getInstance();
    this.cacheService = CacheService.getInstance();
    this.performanceService = PerformanceService.getInstance();
    this.loadBalancerService = LoadBalancerService.getInstance();
  }

  async initialize(): Promise<void> {
    // Register CORS
    await this.fastify.register(cors, {
      origin: config.corsOrigin,
      credentials: true
    });

    // Setup routes
    this.setupRoutes();

    // Setup cleanup interval for rate limiting
    setInterval(() => {
      this.rateLimitService.cleanup();
    }, 60000); // Clean up every minute
  }

  private setupRoutes(): void {
    // Health check
    this.fastify.get('/health', async (request, reply) => {
      return reply.send({ 
        status: 'ok', 
        timestamp: new Date().toISOString()
      });
    });

    // Analyze subject line
    this.fastify.post('/api/analyze-subject', async (request, reply) => {
      const startTime = Date.now();
      let fromCache = false;
      let isError = false;
      
      try {
        // Check load balancer capacity
        const loadBalancerStatus = this.loadBalancerService.getStatus();
        if (!loadBalancerStatus.isHealthy) {
          isError = true;
          return reply.status(503).send({
            error: 'Service temporarily overloaded. Please try again in a moment.',
            retryAfter: 5
          });
        }
        
        // Rate limiting
        const clientIP = request.ip;
        if (!this.rateLimitService.isAllowed(clientIP)) {
          isError = true;
          return reply.status(429).send({
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((this.rateLimitService.getResetTime(clientIP) - Date.now()) / 1000)
          });
        }
        
        // Validate input
        const validationResult = AnalyzeSubjectRequestSchema.safeParse(request.body);
        if (!validationResult.success) {
          isError = true;
          return reply.status(400).send({
            error: 'Invalid input',
            details: validationResult.error.errors
          });
        }
        
        const { subject, industry } = validationResult.data;
        const requestData = { subject, industry };
        
        // Check cache first
        const cachedResponse = this.cacheService.get(requestData);
        if (cachedResponse) {
          fromCache = true;
          this.performanceService.recordRequest(Date.now() - startTime, true, false);
          return reply.send(cachedResponse);
        }
        
        // Process request with load balancing and retry logic
        const analysis = await this.loadBalancerService.processRequest(requestData);
        
        // Cache the response
        this.cacheService.set(requestData, analysis);
        
        // Record performance metrics
        this.performanceService.recordRequest(Date.now() - startTime, false, false);
        
        return reply.send(analysis);
        
      } catch (error) {
        isError = true;
        this.fastify.log.error(error);
        this.performanceService.recordRequest(Date.now() - startTime, fromCache, true);
        return reply.status(500).send({
          error: 'Internal server error'
        });
      }
    });


    // Rate limit info
    this.fastify.get('/api/rate-limit', async (request, reply) => {
      const clientIP = request.ip;
      return reply.send({
        remaining: this.rateLimitService.getRemainingRequests(clientIP),
        resetTime: this.rateLimitService.getResetTime(clientIP)
      });
    });

    // Performance monitoring
    this.fastify.get('/api/performance', async (request, reply) => {
      return reply.send({
        metrics: this.performanceService.getMetrics(),
        cache: this.cacheService.getStats(),
        loadBalancer: this.loadBalancerService.getStatus(),
        health: this.performanceService.getHealthStatus()
      });
    });

    // Cache management
    this.fastify.post('/api/cache/clear', async (request, reply) => {
      this.cacheService.clear();
      return reply.send({ message: 'Cache cleared successfully' });
    });
  }

  async start(): Promise<void> {
    try {
      await this.initialize();
      
      await this.fastify.listen({ 
        port: config.port, 
        host: '0.0.0.0' 
      });
      
      this.fastify.log.info(`🚀 Server listening on port ${config.port}`);
      this.fastify.log.info(`🔒 Rate limit: ${config.rateLimitRequests} requests per ${config.rateLimitWindowMs / 1000}s`);
    } catch (err) {
      this.fastify.log.error(err);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      await this.fastify.close();
    } catch (error) {
      console.error('Error stopping server:', error);
    }
  }
}
