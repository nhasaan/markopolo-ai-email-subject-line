import { z } from 'zod';
import { SUPPORTED_INDUSTRIES } from '../types/industry';

export const AnalyzeSubjectRequestSchema = z.object({
  subject: z.string().min(1, 'Subject line is required').max(200, 'Subject line too long'),
  industry: z.enum(SUPPORTED_INDUSTRIES as [string, ...string[]], {
    errorMap: () => ({ message: `Industry must be one of: ${SUPPORTED_INDUSTRIES.join(', ')}` })
  })
});

export type AnalyzeSubjectRequest = z.infer<typeof AnalyzeSubjectRequestSchema>;

export interface AnalyzeSubjectResponse {
  original: string;
  score: number;
  issues: string[];
  suggestions: string[];
  ai_insights: string;
}

export interface ErrorResponse {
  error: string;
  details?: any;
}
