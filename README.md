# AI-Powered Email Subject Line Optimizer

A full-stack application that analyzes email subject lines and provides AI-powered improvements using OpenAI's API.

## Features

- **Backend**: NodeJS with TypeScript, Fastify, SQLite
- **Frontend**: Astro with TypeScript and Tailwind CSS
- **AI Integration**: OpenAI GPT-3.5-turbo for subject line analysis
- **Scoring System**: Intelligent scoring based on length, industry keywords, urgency, and personalization
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **Database**: SQLite for storing analysis history
- **Responsive UI**: Modern, mobile-friendly interface

## Quick Start

### 1. Install Dependencies
```bash
./install.sh
```

### 2. Environment Setup (Automatic)
The install script automatically creates environment files:
- `backend/.env` - Backend configuration with OpenAI API key
- `frontend/.env` - Frontend configuration with API base URL

**Manual setup (if needed):**
```bash
# Backend environment
cp backend/env.example backend/.env
# Edit backend/.env with your OpenAI API key

# Frontend environment  
cp frontend/env.example frontend/.env
# Edit frontend/.env to change API base URL if needed
```

### 3. Start the Application
```bash
./start.sh
```

**Or start individually:**

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## API Endpoints

### POST /api/analyze-subject

Analyzes an email subject line and returns AI-powered suggestions.

**Request Body:**
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

### GET /health

Health check endpoint.

## Features Implemented

### Core Requirements ✅
- [x] Backend endpoint works
- [x] Frontend sends request and displays response
- [x] OpenAI API integration returns suggestions
- [x] Basic error handling (try/catch)

### Good to Have ✅
- [x] Input validation (empty, too long)
- [x] Loading state while API processes
- [x] Caching to avoid duplicate API calls (rate limiting)
- [x] Score calculation logic
- [x] Clean code structure

### Bonus Points ✅
- [x] Rate limiting consideration
- [x] Keyboard shortcuts (Ctrl/Cmd + Enter to submit)
- [x] Copy button for suggestions
- [x] Explain scoring logic

## Scoring Algorithm

The scoring system evaluates subject lines based on:

1. **Length** (30-50 characters optimal): +10 points
2. **Industry Keywords**: +15 points for relevant keywords
3. **Urgency Words**: +10 points for urgency indicators
4. **Action Words**: +10 points for call-to-action language
5. **Overused Phrases**: -20 points for clichéd language
6. **Personalization**: Identified as an issue if missing

## Technology Stack

### Backend Architecture
- **Node.js** with **TypeScript**
- **Fastify** web framework
- **OpenAI** API integration
- **Zod** for input validation
- **Organized folder structure**: services, dtos, config, server
- **No database required** - pure API service

### Frontend
- **Astro** with **TypeScript**
- **Tailwind CSS** for styling
- **Vanilla JavaScript** for interactivity
- Responsive design

## Environment Variables

### Backend (.env)
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000
```

### Frontend (.env)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
```

**For production deployment:**
- Update `VITE_API_BASE_URL` to your production API URL
- Set `NODE_ENV=production` in backend
- Use your own OpenAI API key

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with hot reload
npm run build  # Builds for production
npm start  # Runs production build
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Astro dev server
npm run build  # Builds for production
npm run preview  # Preview production build
```

## Architecture

### No Database Required
This application is designed as a pure API service without database dependencies:
- **Stateless**: Each request is independent
- **Fast**: No database overhead
- **Simple**: Easy deployment and scaling
- **Focused**: Core functionality only

## Rate Limiting

- 10 requests per minute per IP address
- Returns 429 status code when limit exceeded
- In-memory storage (resets on server restart)

## Error Handling

- Input validation with Zod schemas
- Graceful OpenAI API failure handling
- User-friendly error messages
- Comprehensive logging

## Future Enhancements

- User authentication and personal dashboards
- A/B testing capabilities
- Email template integration
- Advanced analytics and reporting
- Multi-language support
- Team collaboration features
- Optional database for analytics (if needed)
# markopolo-ai-email-subject-line
