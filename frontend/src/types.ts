export interface AnalyzeSubjectRequest {
  subject: string;
  industry: 'e-commerce' | 'SaaS' | 'retail';
}

export interface AnalyzeSubjectResponse {
  original: string;
  score: number;
  issues: string[];
  suggestions: string[];
  ai_insights: string;
}
