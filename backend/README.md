# Email Subject Line Optimizer - Backend

A Node.js backend service for AI-powered email subject line analysis with optional database support.

## 🏗️ Architecture

### Folder Structure
```
src/
├── config/           # Configuration management
├── dtos/            # Data Transfer Objects & validation
├── services/        # Business logic services
├── server/          # Server setup and routes
├── types/           # TypeScript type definitions
└── index.ts         # Application entry point
```

### Services
- **DatabaseService**: Optional SQLite database with in-memory fallback
- **AIService**: OpenAI integration for subject line analysis
- **RateLimitService**: Request rate limiting
- **Server**: Fastify server with route management

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (optional)
USE_DATABASE=true
DATABASE_PATH=./database.sqlite

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
```

### 2. Installation

```bash
npm install
```

### 3. Development

```bash
npm run dev
```

### 4. Production

```bash
npm run build
npm start
```

## 📊 Database Options

### Option 1: SQLite Database (Default)
- Persistent storage
- Analysis history
- Set `USE_DATABASE=true` in `.env`

### Option 2: In-Memory Storage
- No database required
- Faster startup
- Data lost on restart
- Set `USE_DATABASE=false` in `.env`

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | Required | OpenAI API key |
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `USE_DATABASE` | true | Enable database storage |
| `DATABASE_PATH` | ./database.sqlite | SQLite database path |
| `RATE_LIMIT_REQUESTS` | 10 | Requests per window |
| `RATE_LIMIT_WINDOW_MS` | 60000 | Rate limit window (ms) |
| `CORS_ORIGIN` | true | CORS origin setting |

## 🛠️ API Endpoints

### POST /api/analyze-subject
Analyze an email subject line.

**Request:**
```json
{
  "subject": "50% off everything!",
  "industry": "e-commerce"
}
```

**Response:**
```json
{
  "original": "50% off everything!",
  "score": 65,
  "issues": ["too generic", "overused phrase"],
  "suggestions": [
    "Last 24 hours: 50% off your favorites",
    "Flash sale: Half price on top picks",
    "VIP access: 50% savings inside"
  ],
  "ai_insights": "Your subject line lacks personalization..."
}
```

### GET /api/analyses
Get all stored analyses (if database enabled).

### GET /health
Health check endpoint.

### GET /api/rate-limit
Get rate limit information for current IP.

## 🔒 Rate Limiting

- **Default**: 10 requests per minute per IP
- **Configurable**: Via environment variables
- **Response**: 429 status when exceeded
- **Headers**: `Retry-After` included in 429 responses

## 🧪 Development Features

### Hot Reload
```bash
npm run dev  # Uses tsx watch
```

### TypeScript
- Strict type checking
- Path mapping
- Source maps

### Logging
- Structured logging with Fastify
- Different levels for dev/prod
- Error tracking

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure `OPENAI_API_KEY`
3. Set up database (optional)
4. Configure rate limiting

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:3001/health
```

### Rate Limit Status
```bash
curl http://localhost:3001/api/rate-limit
```

### Database Status
- Checked in health endpoint
- Automatic fallback to in-memory

## 🛡️ Security Features

- **Input Validation**: Zod schemas
- **Rate Limiting**: Per-IP request limits
- **CORS**: Configurable origins
- **Error Handling**: No sensitive data exposure
- **Graceful Shutdown**: Clean resource cleanup

## 📈 Performance

- **Fastify**: High-performance web framework
- **Optional Database**: SQLite or in-memory
- **Connection Pooling**: Automatic with SQLite
- **Memory Management**: Automatic cleanup
- **Caching**: Rate limit store optimization

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_PATH` permissions
   - Verify `USE_DATABASE` setting
   - Application will fallback to in-memory

2. **OpenAI API Errors**
   - Verify `OPENAI_API_KEY`
   - Check API quota/limits
   - Service includes fallback responses

3. **Rate Limit Issues**
   - Check `RATE_LIMIT_REQUESTS` setting
   - Monitor `/api/rate-limit` endpoint
   - Adjust limits as needed

### Debug Mode
```bash
NODE_ENV=development npm run dev
```

## 📝 Logs

### Development
- Detailed request/response logs
- Error stack traces
- Database operations

### Production
- Error logs only
- Structured JSON format
- Performance metrics
