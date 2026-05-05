import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

export async function generateThought(type, previousQuotes = []) {
  const tone = type === 'morning' 
    ? 'positive, energetic, fresh start' 
    : 'calm, reflective, gratitude';

  const prompt = `Generate 1 short Hinglish thought.
Rules:
- Max 15 words
- Human-like, natural tone
- No emojis
- No famous quotes
- No repetition

Tone: ${tone}

Avoid these previous thoughts:
${previousQuotes.join('\n')}

Output ONLY the final thought.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates Hinglish thoughts.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI generation failed:', error);
    throw error;
  }
}
