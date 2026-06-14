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

5. Respond ONLY in valid JSON format matching the schema provided.

IMPORTANT: Respond entirely in [TARGET_LANGUAGE]. If the target language is Hindi, write all explanations in Hindi. If Tamil, write in Tamil. Etc.
`;

async function callGemini(
  systemPrompt: string,
  userParts: any[],
  useJsonSchema = false,
  modelName = 'gemini-2.5-flash'
): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey) {
    throw new Error('API key is missing. Please set ANTHROPIC_API_KEY or GEMINI_API_KEY in your env settings.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const requestBody: any = {
    systemInstruction: {
      parts: [
        {
          text: systemPrompt,
        },
      ],
    },
    contents: [
      {
        role: 'user',
        parts: userParts,
      },
    ],
    generationConfig: {},
  };

  if (useJsonSchema) {
    requestBody.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          documentType: { type: 'STRING' },
          overallRisk: { type: 'STRING', enum: ['SAFE', 'CAUTION', 'HIGH_RISK'] },
          riskReason: { type: 'STRING' },
          summary: { type: 'ARRAY', items: { type: 'STRING' } },
          clauses: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                risk: { type: 'STRING', enum: ['SAFE', 'CAUTION', 'RED_FLAG'] },
                originalText: { type: 'STRING' },
                plainExplanation: { type: 'STRING' },
                whyItMatters: { type: 'STRING' },
              },
              required: ['title', 'risk', 'originalText', 'plainExplanation'],
            },
          },
        },
        required: ['documentType', 'overallRisk', 'riskReason', 'summary', 'clauses'],
      },
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // If gemini-2.5-flash fails or is not found, attempt falling back to gemini-1.5-flash
      if (modelName === 'gemini-2.5-flash') {
        console.warn(`gemini-2.5-flash failed with status ${response.status}. Falling back to gemini-1.5-flash...`);
        return callGemini(systemPrompt, userParts, useJsonSchema, 'gemini-1.5-flash');
      }
      throw new Error(`Gemini API error (Status ${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('No content returned from Gemini API.');
    }

    if (useJsonSchema) {
      return JSON.parse(candidateText.trim());
    }

    return candidateText;
  } catch (error) {
    // Attempt fallback for network/unexpected errors as well
    if (modelName === 'gemini-2.5-flash') {
      console.warn('Unexpected error with gemini-2.5-flash. Falling back to gemini-1.5-flash...', error);
      return callGemini(systemPrompt, userParts, useJsonSchema, 'gemini-1.5-flash');
    }
    throw error;
  }
}

export async function analyzeDocumentText(text: string, targetLanguageName: string): Promise<any> {
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('[TARGET_LANGUAGE]', targetLanguageName);
  const userParts = [
    {
      text: `Analyze the following legal document text and output the results in ${targetLanguageName} as JSON:\n\n${text}`
    }
  ];
  return callGemini(systemPrompt, userParts, true);
}

export async function analyzeDocumentImage(
  imageBase64: string,
  imageMimeType: string,
  targetLanguageName: string
): Promise<any> {
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('[TARGET_LANGUAGE]', targetLanguageName);
  const userParts = [
    {
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64,
      },
    },
    {
      text: `Analyze this image of a legal document and output the results in ${targetLanguageName} as JSON. Read all text via OCR first.`
    }
  ];
  return callGemini(systemPrompt, userParts, true);
}

export async function askFollowUpQuestion(
  documentContext: string,
  question: string,
  targetLanguageName: string
): Promise<string> {
  const systemPrompt = `You are DocSaathi, an expert legal document analyzer. Answer the user's question about their document in simple, clear language in ${targetLanguageName}. Avoid legalese and explain clearly. Document content is provided below.`;
  const userParts = [
    {
      text: `Here is the legal document text:\n\n${documentContext}\n\nUser Question: ${question}`
    }
  ];
  return callGemini(systemPrompt, userParts, false);
}

