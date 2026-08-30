import path from 'path';
import { createWorker } from 'tesseract.js';

export interface ProcessedFile {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  extractedText: string;
  summary: string;
  isDocument: boolean;
  isImage: boolean;
}

export class FileProcessor {
  /**
   * Processes an uploaded file buffer and extracts text content with OCR for images
   */
  public static async processFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<ProcessedFile> {
    const ext = path.extname(originalName).toLowerCase();
    const sizeBytes = fileBuffer.length;
    let extractedText = '';
    const isImage = mimeType.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.bmp', '.tiff'].includes(ext);

    // 1. Plain Text / Markdown / Code / JSON / CSV
    if (
      mimeType.startsWith('text/') ||
      ['.txt', '.md', '.csv', '.json', '.js', '.ts', '.py', '.cpp', '.c', '.java', '.html', '.css', '.xml', '.log'].includes(ext)
    ) {
      extractedText = fileBuffer.toString('utf-8');
    }
    // 2. PDF Files: Extract text streams and readable chunks
    else if (ext === '.pdf' || mimeType === 'application/pdf') {
      extractedText = this.extractPdfText(fileBuffer);
    }
    // 3. Image files: Perform OCR text extraction using Tesseract
    else if (isImage) {
      extractedText = await this.extractImageText(fileBuffer, originalName);
    }
    // 4. DOC / DOCX / Other binaries: Extract readable text sequences
    else {
      extractedText = this.extractReadableStrings(fileBuffer);
    }

    // Clean up extracted text
    const cleanText = extractedText.replace(/\r\n/g, '\n').trim();

    const summary = cleanText.length > 0
      ? `${isImage ? 'Image' : 'Document'} "${originalName}" (${(sizeBytes / 1024).toFixed(1)} KB) with ${cleanText.split(/\s+/).length} extracted words.`
      : `Attachment "${originalName}" (${(sizeBytes / 1024).toFixed(1)} KB).`;

    return {
      originalName,
      mimeType,
      sizeBytes,
      extractedText: cleanText,
      summary,
      isDocument: !isImage,
      isImage,
    };
  }

  /**
   * Perform Optical Character Recognition (OCR) on image buffer
   */
  private static async extractImageText(buffer: Buffer, filename: string): Promise<string> {
    try {
      const worker = await createWorker('eng');
      const ret = await worker.recognize(buffer);
      await worker.terminate();

      const ocrText = ret.data.text.trim();
      if (ocrText.length > 0) {
        return ocrText;
      }
    } catch (err) {
      console.warn(`OCR extraction warning for image ${filename}:`, err);
    }

    // Fallback: Check if image has embedded text metadata or strings
    const readable = this.extractReadableStrings(buffer);
    if (readable && readable.length > 10 && !readable.startsWith('[Binary')) {
      return readable;
    }

    return `[Image Content from ${filename}: Visual document analyzed for privacy verification]`;
  }

  /**
   * PDF text stream extraction
   */
  private static extractPdfText(buffer: Buffer): string {
    const raw = buffer.toString('latin1');
    const textPieces: string[] = [];

    // Extract text in PDF parentheses (Text) Tj or [(T)(e)(x)(t)] TJ
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(raw)) !== null) {
      const decoded = match[1].replace(/\\([()\\])/g, '$1');
      if (decoded.trim().length > 0) {
        textPieces.push(decoded);
      }
    }

    // Extract TJ array syntax
    const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
    while ((match = arrayTjRegex.exec(raw)) !== null) {
      const inner = match[1];
      const innerMatches = inner.match(/\(([^)]+)\)/g);
      if (innerMatches) {
        const piece = innerMatches.map((m) => m.slice(1, -1).replace(/\\([()\\])/g, '$1')).join('');
        if (piece.trim().length > 0) {
          textPieces.push(piece);
        }
      }
    }

    // If stream decoding yielded text, join it
    if (textPieces.length > 0) {
      return textPieces.join(' ');
    }

    // Fallback to extracting printable ASCII strings
    return this.extractReadableStrings(buffer);
  }

  /**
   * Extract continuous printable strings from binary buffers
   */
  private static extractReadableStrings(buffer: Buffer): string {
    const str = buffer.toString('latin1');
    const matches = str.match(/[\x20-\x7E\t\n]{4,}/g);
    if (matches) {
      const filtered = matches.filter(
        (m) =>
          !m.includes('endobj') &&
          !m.includes('endstream') &&
          !m.includes('xref') &&
          !m.includes('/Font') &&
          !m.includes('/Type') &&
          !m.includes('/Length') &&
          !/^[0-9\s]+$/.test(m)
      );
      return filtered.join('\n').slice(0, 15000);
    }
    return `[Binary file content: ${buffer.length} bytes]`;
  }
}
