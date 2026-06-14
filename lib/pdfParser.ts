/**
 * Extracts raw text from a PDF Buffer using pdf-parse v2 class API.
 * Uses dynamic require() inside the function so that:
 *  1. The DOMMatrix polyfill is set before any pdf-parse code runs.
 *  2. Next.js (webpack) can externalize it properly via serverComponentsExternalPackages.
 */
export async function parsePdfText(pdfBuffer: Buffer): Promise<string> {
  // Must polyfill BEFORE requiring pdf-parse — pdf-parse reads DOMMatrix on module load
  if (typeof global !== 'undefined' && !(global as any).DOMMatrix) {
    (global as any).DOMMatrix = class DOMMatrix {
      m11 = 1; m12 = 0; m13 = 0; m14 = 0;
      m21 = 0; m22 = 1; m23 = 0; m24 = 0;
      m31 = 0; m32 = 0; m33 = 1; m34 = 0;
      m41 = 0; m42 = 0; m43 = 0; m44 = 1;
      is2D = true;
      isIdentity = true;
    };
  }

  try {
    // Dynamic require inside the function — avoids top-level bundling by webpack
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfModule = require('pdf-parse');

    // pdf-parse v2 exports a named class `PDFParse`, not a default function
    const PDFParse = pdfModule.PDFParse;

    if (!PDFParse || typeof PDFParse !== 'function') {
      // Fallback: maybe it's still the old API (default export is a function)
      const legacyParser = typeof pdfModule === 'function'
        ? pdfModule
        : pdfModule.default;

      if (typeof legacyParser === 'function') {
        const data = await legacyParser(pdfBuffer);
        return data.text || '';
      }

      throw new Error(`pdf-parse did not export a valid parser. Keys: ${Object.keys(pdfModule).join(', ')}`);
    }

    // v2 API: instantiate PDFParse with { data: Buffer } then call getText()
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    return result.text || '';
  } catch (error: any) {
    console.error('Error parsing PDF text:', error);
    throw new Error('Failed to parse PDF document. It may be corrupt or encrypted.');
  }
}
