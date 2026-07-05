import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 500 });
    }

    // Expect JSON body with base64Data and mimeType
    const json = await req.json();
    if (!json || !json.base64Data) {
      return NextResponse.json({ error: 'No image data provided.' }, { status: 400 });
    }

    const { base64Data, mimeType = 'image/jpeg' } = json;
    const imageDataUrl = `data:${mimeType};base64,${base64Data}`;

    const groq = new Groq({ apiKey: groqApiKey });

    const prompt = `You are a highly accurate AI that extracts food menu items from images of physical restaurant menus.
Extract all the categories and their respective items from the provided image.

Return ONLY a valid JSON object matching the following structure. Do NOT wrap it in markdown code blocks. Do NOT add any extra text or explanations.

{
  "categories": [
    {
      "name": "Category Name (e.g. Starters, Mains, Desserts)",
      "items": [
        {
          "name": "Item Name",
          "price": 15.99,
          "description": "Optional brief description or ingredients found",
          "is_veg": true,
          "ingredients": "Extracted list of ingredients if explicitly mentioned"
        }
      ]
    }
  ]
}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    let responseContent = chatCompletion.choices[0]?.message?.content ?? '';
    responseContent = responseContent
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (!responseContent) throw new Error('Failed to extract menu data.');

    let parsedData;
    try {
      parsedData = JSON.parse(responseContent);
    } catch (e) {
      console.error('Failed to parse AI JSON:', responseContent);
      throw new Error('AI returned invalid JSON format.');
    }

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('API /extract-menu error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}
