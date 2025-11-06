import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { logInfo, logError } from '../../config/logger';

export interface ExtractedCVData {
  text: string;
  sections?: {
    personalInfo?: string;
    experience?: string;
    education?: string;
    skills?: string;
    summary?: string;
  };
  metadata?: {
    wordCount: number;
    pageCount?: number;
    language?: string;
  };
}

export class CVService {
  /**
   * Parse CV file and extract text content with structure
   * Supports PDF, Word (.docx, .doc), ODT, RTF, and plain text
   */
  async parseCV(filePath: string): Promise<ExtractedCVData> {
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

      let rawText: string;
      let pageCount: number | undefined;

      switch (fileExtension) {
        case '.pdf':
          const pdfResult = await this.parsePDF(fullPath);
          rawText = pdfResult.text;
          pageCount = pdfResult.pageCount;
          break;
        
        case '.doc':
        case '.docx':
          rawText = await this.parseWord(fullPath);
          break;

        case '.odt':
          rawText = await this.parseODT(fullPath);
          break;

        case '.rtf':
          rawText = await this.parseRTF(fullPath);
          break;

        case '.txt':
          rawText = await this.parseText(fullPath);
          break;
        
        default:
          throw new Error(`Unsupported file type: ${fileExtension}. Supported formats: PDF, DOC, DOCX, ODT, RTF, TXT`);
      }

      // Extract structured data from text
      const structured = this.extractStructure(rawText);
      
      return {
        text: rawText,
        sections: structured,
        metadata: {
          wordCount: rawText.split(/\s+/).filter(w => w.length > 0).length,
          pageCount,
        },
      };
    } catch (error) {
      logError('Error parsing CV', error as Error, { filePath });
      throw new Error(`Failed to parse CV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse CV and return just text (backward compatibility)
   */
  async parseCVText(filePath: string): Promise<string> {
    const result = await this.parseCV(filePath);
    return result.text;
  }

  /**
   * Parse PDF file and extract text with page count
   */
  private async parsePDF(filePath: string): Promise<{ text: string; pageCount?: number }> {
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
      
      let text = '';
      let pageCount: number | undefined;
      
      // TextResult has a text property with concatenated text
      if (textResult && textResult.text) {
        text = textResult.text.trim();
      } else if (textResult && textResult.pages && Array.isArray(textResult.pages)) {
        // If textResult has pages, concatenate them
        text = textResult.pages
          .map((page: any) => page.text || '')
          .join('\n')
          .trim();
        pageCount = textResult.pages.length;
      }
      
      if (!text) {
        throw new Error('No text extracted from PDF');
      }

      return { text, pageCount };
    } catch (error) {
      logError('Error parsing PDF', error as Error, { filePath });
      throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse Word document (.docx) and extract text
   */
  private async parseWord(filePath: string): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      if (result.messages && result.messages.length > 0) {
        logInfo('Word document parsing warnings', { messages: result.messages, filePath });
      }
      return result.value.trim();
    } catch (error) {
      logError('Error parsing Word document', error as Error, { filePath });
      throw new Error(`Failed to parse Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse ODT (OpenDocument Text) file
   * ODT files are ZIP archives containing XML, we can extract text from content.xml
   */
  private async parseODT(filePath: string): Promise<string> {
    try {
      // ODT files are ZIP archives - we need to extract content.xml
      // For now, we'll use a simple approach: try to read as ZIP and extract XML
      const AdmZip = await import('adm-zip');
      const zip = new AdmZip.default(filePath);
      const contentXml = zip.readAsText('content.xml');
      
      // Extract text from XML (simple regex-based extraction)
      // Remove XML tags and decode entities
      let text = contentXml
        .replace(/<[^>]+>/g, ' ') // Remove XML tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#(\d+);/g, (_match: string, dec: string) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();

      if (!text || text.length < 10) {
        throw new Error('No meaningful text extracted from ODT file');
      }

      return text;
    } catch (error) {
      logError('Error parsing ODT file', error as Error, { filePath });
      // Fallback: try to read as plain text (won't work but gives better error)
      throw new Error(`Failed to parse ODT file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse RTF (Rich Text Format) file
   * RTF is a text-based format, we can extract text by removing RTF control codes
   */
  private async parseRTF(filePath: string): Promise<string> {
    try {
      const rtfContent = fs.readFileSync(filePath, 'utf-8');
      
      // RTF parsing: remove control codes and extract text
      // This is a simplified parser - full RTF parsing is complex
      let text = rtfContent
        // Remove RTF header
        .replace(/{\\rtf[^}]*}/gi, '')
        // Remove control words (e.g., \b, \par, \f0)
        .replace(/\\[a-z]+\d*\s*/gi, ' ')
        // Remove control symbols (e.g., \{, \}, \\)
        .replace(/\\[{}'\\]/g, '')
        // Remove braces
        .replace(/[{}]/g, ' ')
        // Decode common RTF entities
        .replace(/\\u(\d+)\s*/g, (_match, dec) => {
          const code = parseInt(dec, 10);
          return code > 0 && code < 65536 ? String.fromCharCode(code) : ' ';
        })
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();

      if (!text || text.length < 10) {
        throw new Error('No meaningful text extracted from RTF file');
      }

      return text;
    } catch (error) {
      logError('Error parsing RTF file', error as Error, { filePath });
      throw new Error(`Failed to parse RTF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse plain text file
   */
  private async parseText(filePath: string): Promise<string> {
    try {
      const text = fs.readFileSync(filePath, 'utf-8');
      return text.trim();
    } catch (error) {
      logError('Error parsing text file', error as Error, { filePath });
      throw new Error(`Failed to parse text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract structured sections from CV text
   */
  private extractStructure(text: string): ExtractedCVData['sections'] {
    const sections: ExtractedCVData['sections'] = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Common section headers in Norwegian and English
    const sectionPatterns = {
      personalInfo: /^(personlig|personal|kontakt|contact|navn|name|adresse|address)/i,
      experience: /^(erfaring|experience|arbeidserfaring|work experience|yrkeserfaring|professional experience|karriere|career)/i,
      education: /^(utdanning|education|utdannelse|skole|school|universitet|university|studier|studies)/i,
      skills: /^(ferdigheter|skills|kompetanse|competence|kunnskap|knowledge|teknisk|technical)/i,
      summary: /^(sammendrag|summary|profil|profile|om meg|about me|introduksjon|introduction)/i,
    };

    let currentSection: keyof typeof sections | null = null;
    const sectionContent: Record<string, string[]> = {};

    for (const line of lines) {
      // Check if line is a section header
      let isHeader = false;
      for (const [section, pattern] of Object.entries(sectionPatterns)) {
        if (pattern.test(line) && line.length < 50) {
          currentSection = section as keyof typeof sections;
          isHeader = true;
          if (!sectionContent[section]) {
            sectionContent[section] = [];
          }
          break;
        }
      }

      if (!isHeader && currentSection) {
        sectionContent[currentSection].push(line);
      }
    }

    // Convert arrays to strings
    for (const [section, content] of Object.entries(sectionContent)) {
      if (content.length > 0) {
        sections[section as keyof typeof sections] = content.join('\n');
      }
    }

    return Object.keys(sections).length > 0 ? sections : undefined;
  }

  /**
   * Extract key information from CV text for AI processing
   * This is a helper to format CV content for better AI understanding
   * Now supports structured CV data
   */
  formatCVForAI(cvData: ExtractedCVData | string): string {
    const cvText = typeof cvData === 'string' ? cvData : cvData.text;
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

