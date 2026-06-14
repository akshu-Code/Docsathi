import { NextRequest, NextResponse } from 'next/server';
import { parsePdfText } from '@/lib/pdfParser';
import { analyzeDocumentText, analyzeDocumentImage } from '@/lib/claude';

// Simple in-memory rate limiter: Map of IP address -> array of timestamps
const rateLimitMap = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const clientRequests = rateLimitMap.get(ip) || [];
    // Prune requests older than 1 hour
    const recentRequests = clientRequests.filter(ts => ts > oneHourAgo);
    
    if (recentRequests.length >= 10) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 document analyses per hour.' },
        { status: 429 }
      );
    }
    
    recentRequests.push(now);
    rateLimitMap.set(ip, recentRequests);

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const language = formData.get('language') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }
    if (!language) {
      return NextResponse.json({ error: 'No language specified.' }, { status: 400 });
    }

    // 3. Server-side File Validation
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit.' }, { status: 400 });
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or Image.' }, { status: 400 });
    }

    let result: any;

    // 4. File Processing & Claude Analysis
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const text = await parsePdfText(buffer);
      
      if (!text || !text.trim()) {
        return NextResponse.json({ 
          error: 'This PDF appears to have no extractable text. Please upload a scanned PDF as an image or upload a readable text PDF.' 
        }, { status: 400 });
      }
      
      result = await analyzeDocumentText(text, language);
    } else {
      // Vision model OCR
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      result = await analyzeDocumentImage(base64, file.type, language);
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error during document analysis API:', error);
    return NextResponse.json({ 
      error: error.message || 'An unexpected error occurred during analysis. Please try again.' 
    }, { status: 500 });
  }
}
