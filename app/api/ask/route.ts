import { NextRequest, NextResponse } from 'next/server';
import { askFollowUpQuestion } from '@/lib/claude';

export async function POST(req: NextRequest) {
  try {
    const { documentContext, question, language } = await req.json();

    if (!documentContext) {
      return NextResponse.json({ error: 'No document context provided.' }, { status: 400 });
    }
    if (!question) {
      return NextResponse.json({ error: 'No question provided.' }, { status: 400 });
    }
    if (!language) {
      return NextResponse.json({ error: 'No language specified.' }, { status: 400 });
    }

    const answer = await askFollowUpQuestion(documentContext, question, language);
    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error('Error answering follow-up question:', error);
    return NextResponse.json({ 
      error: error.message || 'An error occurred while answering your question.' 
    }, { status: 500 });
  }
}
