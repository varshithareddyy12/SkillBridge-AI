import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { logger } from '../utils/logger.js';
import { AIService } from './ai.service.js';
import { ParsedResumeData } from '../types/index.js';

export class ResumeParserService {
  /**
   * Extract raw text from uploaded file buffer based on mimetype and extension
   */
  public static async extractRawText(
    buffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<string> {
    try {
      if (mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
        const data = await pdfParse(buffer);
        return data.text || '';
      }

      if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.toLowerCase().endsWith('.docx')
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      }

      if (mimeType.startsWith('text/') || fileName.toLowerCase().endsWith('.txt')) {
        return buffer.toString('utf-8');
      }

      // Fallback: try utf-8 string
      return buffer.toString('utf-8');
    } catch (error: any) {
      logger.error('Failed to parse document text:', error);
      throw new Error(`Unable to extract text from ${fileName}: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Complete pipeline: extract text and parse into structured profile
   */
  public static async processResume(
    buffer: Buffer,
    mimeType: string,
    fileName: string
  ): Promise<{ rawText: string; parsedData: ParsedResumeData }> {
    const rawText = await this.extractRawText(buffer, mimeType, fileName);

    if (!rawText || rawText.trim().length < 15) {
      throw new Error('The uploaded file appears to be empty or unreadable.');
    }

    const parsedData = await AIService.parseResumeText(rawText);

    return {
      rawText,
      parsedData,
    };
  }
}
