import { GoogleGenAI } from '@google/genai';
import { ENV } from './env.js';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!ENV.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    try {
      geminiClient = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
    } catch (error) {
      console.warn('Failed to initialize Google Gemini client:', error);
      return null;
    }
  }
  return geminiClient;
}

export function isGeminiAvailable(): boolean {
  return Boolean(ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY.trim() !== '');
}
