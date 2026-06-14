import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT_TEMPLATE = `You are DocSaathi, an expert legal document analyzer. Your job is to help ordinary people — not lawyers — understand legal documents they need to sign.

The user will give you extracted text or an image of a legal document. You must:

1. Detect the document type (rental agreement, employment contract, loan document, NDA, terms & conditions, etc.)

2. Provide a PLAIN LANGUAGE SUMMARY in 5-6 bullet points. Write as if explaining to a 12-year-old. Use "You" and "They" — not legal terms.

3. Identify and explain every important clause. For each clause:
   - Give it a plain English name
   - Assign a risk level: SAFE, CAUTION, or RED_FLAG
   - Explain what it means in 1-2 simple sentences
   - For RED_FLAG items, explain exactly why it is risky

4. Give an OVERALL RISK SCORE: 
   - SAFE (0-2 red flags)
   - CAUTION (3-5 red flags or notable concerns)
   - HIGH_RISK (6+ red flags or any clause that could cause serious harm)

5. Respond ONLY in valid JSON format — no markdown, no backticks, just raw JSON.

IMPORTANT: Respond entirely in [TARGET_LANGUAGE]. If the target language is Hindi, write all explanations in Hindi. If Tamil, write in Tamil. Etc.

JSON Response Format:
{
  "documentType": "string",
  "overallRisk": "SAFE" | "CAUTION" | "HIGH_RISK",
  "riskReason": "string — one sentence explaining the overall risk verdict",
  "summary": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "clauses": [
    {
      "title": "string",
      "risk": "SAFE" | "CAUTION" | "RED_FLAG",
      "originalText": "string — the actual clause text from the document",
      "plainExplanation": "string — simple explanation",
      "whyItMatters": "string — only for CAUTION and RED_FLAG"
    }
  ]
}
`;

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  // Strip any markdown code block wraps (like ```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '');
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
  }
  return cleaned.trim();
}

async function callClaude(messages: any[], systemPrompt: string, retryCount = 0): Promise<any> {
  const modelName = 'claude-3-5-sonnet-20241022';
  try {
    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 4000,
      system: systemPrompt,
      messages: messages,
      temperature: 0.1, // low temperature for structured output
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || !('text' in textContent)) {
      throw new Error('Claude did not return text content.');
    }

    const rawText = textContent.text;
    const cleanedText = cleanJsonResponse(rawText);

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(`JSON Parse Error on attempt ${retryCount + 1}:`, parseError, 'Raw response:', rawText);
      if (retryCount < 1) {
        // Retry once by prompting again with the malformed output
        console.log('Retrying Claude API call due to malformed JSON...');
        const retryMessages = [
          ...messages,
          { role: 'assistant', content: rawText },
          { role: 'user', content: 'Your response was not valid JSON. Please output only the valid raw JSON object matching the format exactly. Do not wrap in markdown or backticks.' }
        ];
        return callClaude(retryMessages, systemPrompt, retryCount + 1);
      }
      throw parseError;
    }
  } catch (error) {
    console.error('Error in callClaude:', error);
    throw error;
  }
}

export async function analyzeDocumentText(text: string, targetLanguageName: string): Promise<any> {
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('[TARGET_LANGUAGE]', targetLanguageName);
  const messages = [
    {
      role: 'user',
      content: `Analyze the following legal document text and output the results in ${targetLanguageName} as JSON:\n\n${text}`
    }
  ];
  return callClaude(messages, systemPrompt);
}

export async function analyzeDocumentImage(
  imageBase64: string,
  imageMimeType: string,
  targetLanguageName: string
): Promise<any> {
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('[TARGET_LANGUAGE]', targetLanguageName);
  const messages = [
    {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageMimeType as any,
            data: imageBase64,
          },
        },
        {
          type: 'text',
          content: `Analyze this image of a legal document and output the results in ${targetLanguageName} as JSON. Read all text via OCR first.`
        }
      ] as any
    }
  ];
  return callClaude(messages, systemPrompt);
}

export async function askFollowUpQuestion(
  documentContext: string,
  question: string,
  targetLanguageName: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: `You are DocSaathi, an expert legal document analyzer. Answer the user's question about their document in simple, clear language in ${targetLanguageName}. Avoid legalese and explain clearly. Document content is provided below.`,
      messages: [
        {
          role: 'user',
          content: `Here is the legal document text:\n\n${documentContext}\n\nUser Question: ${question}`
        }
      ],
      temperature: 0.3,
    });
    
    const textContent = response.content.find(c => c.type === 'text');
    return textContent && 'text' in textContent ? textContent.text : 'Sorry, I could not generate an answer.';
  } catch (error) {
    console.error('Error in askFollowUpQuestion:', error);
    throw error;
  }
}
