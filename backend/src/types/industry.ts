// Industry types and configuration
export type Industry = 'e-commerce' | 'SaaS' | 'retail' | 'healthcare' | 'finance' | 'education' | 'technology' | 'real-estate' | 'automotive' | 'food-beverage';

export const SUPPORTED_INDUSTRIES: Industry[] = [
  'e-commerce',
  'SaaS', 
  'retail',
  'healthcare',
  'finance',
  'education',
  'technology',
  'real-estate',
  'automotive',
  'food-beverage'
];

export const INDUSTRY_KEYWORDS: Record<Industry, string[]> = {
  'e-commerce': ['sale', 'discount', 'offer', 'deal', 'save', 'buy', 'shop', 'cart', 'checkout'],
  'SaaS': ['free', 'trial', 'demo', 'upgrade', 'feature', 'productivity', 'efficiency', 'automation'],
  'retail': ['new', 'trending', 'popular', 'bestseller', 'exclusive', 'limited', 'collection'],
  'healthcare': ['health', 'wellness', 'care', 'treatment', 'doctor', 'medical', 'wellness'],
  'finance': ['investment', 'savings', 'loan', 'credit', 'financial', 'money', 'wealth'],
  'education': ['learn', 'course', 'training', 'skill', 'education', 'knowledge', 'study'],
  'technology': ['innovation', 'digital', 'tech', 'software', 'hardware', 'solution'],
  'real-estate': ['property', 'home', 'house', 'apartment', 'investment', 'market'],
  'automotive': ['car', 'vehicle', 'auto', 'drive', 'transportation', 'mobility'],
  'food-beverage': ['food', 'restaurant', 'dining', 'taste', 'flavor', 'recipe', 'cooking']
};

export const INDUSTRY_DISPLAY_NAMES: Record<Industry, string> = {
  'e-commerce': 'E-commerce',
  'SaaS': 'SaaS',
  'retail': 'Retail',
  'healthcare': 'Healthcare',
  'finance': 'Finance',
  'education': 'Education',
  'technology': 'Technology',
  'real-estate': 'Real Estate',
  'automotive': 'Automotive',
  'food-beverage': 'Food & Beverage'
};
