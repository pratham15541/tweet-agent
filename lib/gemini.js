import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../constants/constant.js";
import { loadHistory, saveHistory } from './store.js';
import { hash } from './utils.js';

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function generateTweet(context) {
  const history = loadHistory();               // array of previous tweet strings
  const recent = history.slice(-10);           // last 10 is enough context

  const prompt = `You are a tech influencer.
Previously tweeted (avoid repeating these):
${recent.join('\n')}

Context for today:
${context}

Write a single NEW, distinct tweet ≤ 280 chars that sparks discussion and includes 2-3 relevant hashtags.`;

  const res = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: 'Never repeat any of the “Previously tweeted” lines.',
    },
  });

  const tweet = res.text.trim();
  saveHistory([...history, tweet]);
  return tweet  ;
}
