import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';

export class CVService {
  /**
   * Parse CV file and extract text content
   * Supports PDF and Word documents (.docx)
   */
  async parseCV(filePath: string): Promise<string> {
    try {
      // Handle both relative paths (/uploads/cvs/...) and absolute paths
      const fullPath = filePath.startsWith('/')
        ? path.join(process.cwd(), filePath)
        : filePath.startsWith('uploads')
        ? path.join(process.cwd(), filePath)
        : path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), 'uploads', 'cvs', path.basename(filePath));
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`CV file not found: ${fullPath} (original: ${filePath})`);
      }

      const fileExtension = path.extname(filePath).toLowerCase();

      switch (fileExtension) {
        case '.pdf':
          return await this.parsePDF(fullPath);
        
        case '.doc':
        case '.docx':
          return await this.parseWord(fullPath);
        
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      console.error('Error parsing CV:', error);
      throw new Error(`Failed to parse CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse PDF file and extract text
   */
  private async parsePDF(filePath: string): Promise<string> {
    try {
      // pdf-parse v2.4.5+ uses PDFParse class
      const pdfParseModule = await import('pdf-parse');
      const PDFParse = (pdfParseModule as any).PDFParse;
      
      if (!PDFParse) {
        throw new Error('PDFParse class not found in pdf-parse module');
      }
      
      const dataBuffer = fs.readFileSync(filePath);
      
      // Convert Buffer to Uint8Array as required by pdf-parse v2.4.5+
      const uint8Array = new Uint8Array(dataBuffer);
      
      // PDFParse constructor takes Uint8Array, then call getText() method
      const parser = new PDFParse(uint8Array);
      const textResult = await parser.getText();
      
      // TextResult has a text property with concatenated text
      if (textResult && textResult.text) {
        return textResult.text.trim();
      }
      
      // If textResult has pages, concatenate them
      if (textResult && textResult.pages && Array.isArray(textResult.pages)) {
        const text = textResult.pages
          .map((page: any) => page.text || '')
          .join('\n');
        return text.trim();
      }
      
      throw new Error('No text extracted from PDF');
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Word document (.docx) and extract text
   */
  private async parseWord(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    } catch (error) {
      console.error('Error parsing Word document:', error);
      throw new Error('Failed to parse Word document');
    }
  }

  /**
   * Extract key information from CV text for AI processing
   * This is a helper to format CV content for better AI understanding
   */
  formatCVForAI(cvText: string): string {
    // Keep line breaks and structure - DON'T collapse all whitespace to single spaces
    // Only normalize excessive whitespace (3+ spaces or line breaks)
    let cleaned = cvText
      .replace(/[ \t]{3,}/g, ' ')  // Multiple spaces/tabs -> single space
      .replace(/\n{4,}/g, '\n\n\n')  // 4+ newlines -> 3 newlines
      .replace(/[ \t]+\n/g, '\n')  // Spaces before newline -> just newline
      .replace(/\n[ \t]+/g, '\n')  // Spaces after newline -> just newline
      .trim();

    // Keep more CV content - increase to 5000 chars for better matching
    // The prompt structure allows for this
    if (cleaned.length > 5000) {
      // Try to keep important sections: find natural breakpoints
      const truncated = cleaned.substring(0, 5000);
      // Try to cut at a sentence or paragraph end
      const lastPeriod = truncated.lastIndexOf('.');
      const lastNewline = truncated.lastIndexOf('\n\n');
      const cutPoint = lastNewline > 4500 ? lastNewline : (lastPeriod > 4500 ? lastPeriod : 5000);
      
      if (cutPoint > 4500) {
        cleaned = truncated.substring(0, cutPoint) + '\n\n[...]';
      } else {
        cleaned = truncated + '\n\n[...]';
      }
    }

    return cleaned;
  }
}

