import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'GitHub repository URL is required' }, { status: 400 });

    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return NextResponse.json({ error: 'Invalid GitHub URL. Must be like https://github.com/owner/repo' }, { status: 400 });

    const tempFilePath = path.join(os.tmpdir(), `digest-${Date.now()}.txt`);
    
    try {
        console.log(`Running official Gitingest on ${url}...`);
        await execAsync(`gitingest "${url}" -o "${tempFilePath}"`);
    } catch (e: unknown) {
        throw new Error("GitIngest official tool failed to run: " + String(e));
    }
    
    const digest = await fs.readFile(tempFilePath, 'utf8');
    await fs.unlink(tempFilePath).catch(()=>null);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are an expert software engineer.
Analyze the given codebase and respond in a short, point-to-point format.

Use this structure strictly:
1. PROJECT: What it does (1–2 lines), Type (web app / API / etc.), Tech stack
2. STRUCTURE: Key folders/files (1-line each)
3. FEATURES: Main functionalities (bullet points)
4. KEY FILES: File name → purpose (1 line each)
5. DATA FLOW: Short flow (e.g., User → API → DB → Response)
6. SUMMARY: Explain like a beginner (max 3 lines)

RULES:
- Keep it concise
- Use bullet points only
- No long paragraphs
- Max 150–200 words total

**CRITICAL REQUIREMENT**: You MUST return the output EXACTLY as a raw JSON object with the following keys corresponding to the sections above. Do not wrap it in markdown block quotes. Provide no text outside the JSON.
{
  "project": "...",
  "structure": "...",
  "features": "...",
  "keyFiles": "...",
  "dataFlow": "...",
  "summary": "..."
}

Now analyze the codebase:
${digest.substring(0, 500000)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
         responseMimeType: "application/json",
         temperature: 0.2
      }
    });

    const textRes = response.text;
    if (!textRes) throw new Error("Empty response from Gemini AI. Check logs.");
    
    let cleanJson = textRes.trim();
    if (cleanJson.startsWith('```json')) cleanJson = cleanJson.substring(7);
    if (cleanJson.endsWith('```')) cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    
    return NextResponse.json(JSON.parse(cleanJson));

  } catch (err: unknown) {
    console.error(err);
    const errorMsg = (err as Error).message || '';
    if (errorMsg && errorMsg.includes('429')) {
       return NextResponse.json({ error: 'AI Rate Limit Exceeded: The codebase is too large or you have sent too many requests. Please use a smaller repo or try again in a minute.' }, { status: 429 });
    }
    return NextResponse.json({ error: errorMsg || 'Internal error occurred' }, { status: 500 });
  }
}
