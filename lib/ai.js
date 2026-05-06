import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DEEPSEEK_API_KEY) {
  console.warn('⚠️ WARNING: DEEPSEEK_API_KEY is not set. AI generation will fail.');
}

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
});

const CATEGORIES = ['motivation', 'discipline', 'calm', 'focus'];

export async function generateThought(type, previousQuotes = []) {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  
  const tone = type === 'morning' 
    ? 'positive, energetic, fresh start' 
    : 'calm, reflective, gratitude';

  const personality = "You are a calm, wise mentor who understands human struggle. You speak in a way that is relatable and deeply encouraging.";

  const prompt = `Generate 1 short Hinglish thought.
Rules:
- Max 15 words
- Human-like, natural tone
- No emojis
- No famous quotes
- No repetition
- Category: ${category}

Tone: ${tone}

Avoid these previous thoughts:
${previousQuotes.join('\n')}

Output ONLY the final thought.`;

  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY environment variable is not set');
    }

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: personality },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8, // Slightly higher for more variety
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error('No content in AI response');
    }

    const thought = response.choices[0].message.content.trim().replace(/^"|"$/g, '');
    return { thought, category };
  } catch (error) {
    console.error('AI generation failed:', error.message || error);
    throw error;
  }
}
