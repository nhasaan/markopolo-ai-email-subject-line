import OpenAI from 'openai';
import { AnalyzeSubjectRequest, AnalyzeSubjectResponse } from '../dtos/analyze-subject.dto';
import { config } from '../config';
import { INDUSTRY_KEYWORDS, Industry } from '../types/industry';

export class AIService {
  private static openai: OpenAI;
  private static instance: AIService;

  private constructor() {
    AIService.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private static calculateScore(subject: string, industry: Industry): number {
    let score = 50; // Base score
    
    // Length scoring (optimal: 30-50 characters)
    if (subject.length < 30) score += 10;
    else if (subject.length > 50) score -= 10;
    
    // Industry-specific scoring
    const keywords = INDUSTRY_KEYWORDS[industry] || [];
    const hasIndustryKeywords = keywords.some(keyword => 
      subject.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasIndustryKeywords) score += 15;
    
    // Urgency and action words
    const urgencyWords = ['now', 'today', 'limited', 'exclusive', 'urgent', 'act fast'];
    const actionWords = ['get', 'grab', 'claim', 'unlock', 'discover', 'try', 'start'];
    
    const hasUrgency = urgencyWords.some(word => 
      subject.toLowerCase().includes(word)
    );
    const hasAction = actionWords.some(word => 
      subject.toLowerCase().includes(word)
    );
    
    if (hasUrgency) score += 10;
    if (hasAction) score += 10;
    
    // Penalize overused phrases
    const overusedPhrases = ['click here', 'don\'t miss', 'act now', 'limited time'];
    const hasOverused = overusedPhrases.some(phrase => 
      subject.toLowerCase().includes(phrase.toLowerCase())
    );
    
    if (hasOverused) score -= 20;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score));
  }

  private static identifyIssues(subject: string, industry: Industry): string[] {
    const issues: string[] = [];
    
    if (subject.length < 20) issues.push('too short');
    if (subject.length > 60) issues.push('too long');
    if (subject.length < 30 || subject.length > 50) issues.push('suboptimal length');
    
    // Check for overused phrases
    const overusedPhrases = ['click here', 'don\'t miss', 'act now', 'limited time', 'hurry'];
    const hasOverused = overusedPhrases.some(phrase => 
      subject.toLowerCase().includes(phrase.toLowerCase())
    );
    if (hasOverused) issues.push('overused phrase');
    
    // Check for generic language
    const genericWords = ['amazing', 'incredible', 'fantastic', 'awesome', 'great'];
    const hasGeneric = genericWords.some(word => 
      subject.toLowerCase().includes(word)
    );
    if (hasGeneric) issues.push('too generic');
    
    // Check for personalization
    const personalWords = ['you', 'your', 'personalized', 'custom'];
    const hasPersonal = personalWords.some(word => 
      subject.toLowerCase().includes(word)
    );
    if (!hasPersonal) issues.push('lacks personalization');
    
    return issues;
  }

  async analyzeSubject(request: AnalyzeSubjectRequest): Promise<AnalyzeSubjectResponse> {
    try {
      const { subject, industry } = request;
      
      // Calculate score and identify issues
      const score = AIService.calculateScore(subject, industry);
      const issues = AIService.identifyIssues(subject, industry);
      
      // Generate AI suggestions and insights
      const prompt = `
        Analyze this email subject line for the ${industry} industry: "${subject}"
        
        Provide:
        1. 3 alternative subject lines that are more engaging and effective
        2. One key insight about why the original subject line could be improved
        
        Focus on:
        - Industry-specific language and benefits
        - Creating urgency without being pushy
        - Personalization and relevance
        - Clear value proposition
        - Optimal length (30-50 characters)
        
        Format the response as JSON:
        {
          "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
          "insight": "your insight here"
        }
      `;
      
      const completion = await AIService.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing strategist. Provide concise, actionable feedback on email subject lines.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const aiResponse = completion.choices[0]?.message?.content;
      let suggestions: string[] = [];
      let ai_insights = 'AI analysis unavailable';
      
      if (aiResponse) {
        try {
          const parsed = JSON.parse(aiResponse);
          suggestions = parsed.suggestions || [];
          ai_insights = parsed.insight || ai_insights;
        } catch (e) {
          // Fallback if JSON parsing fails
          suggestions = [
            `Enhanced: ${subject}`,
            `New: ${subject} - Limited Time`,
            `Improved: ${subject} - Don't Miss Out`
          ];
          ai_insights = 'The subject line could benefit from more specific language and clearer value proposition.';
        }
      }
      
      return {
        original: subject,
        score,
        issues,
        suggestions,
        ai_insights
      };
      
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Fallback response if AI service fails
      return {
        original: request.subject,
        score: AIService.calculateScore(request.subject, request.industry),
        issues: AIService.identifyIssues(request.subject, request.industry),
        suggestions: [
          `Enhanced: ${request.subject}`,
          `New: ${request.subject} - Limited Time`,
          `Improved: ${request.subject} - Don't Miss Out`
        ],
        ai_insights: 'AI analysis temporarily unavailable. Consider adding urgency, personalization, and clear value proposition.'
      };
    }
  }
}
