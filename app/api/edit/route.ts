import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const body = await request.json();

    const command = body.command;

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        {
          error: "Command is required.",
        },
        {
          status: 400,
        }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an AI video editing assistant.

Convert the user's natural language video editing command into a structured editing plan.

The video editor will later use this plan to actually edit videos with FFmpeg.

User command:

${command}

Return ONLY valid JSON.

The JSON must contain exactly these fields:

{
  "duration": number,
  "aspectRatio": "9:16" | "16:9" | "1:1",
  "style": "normal" | "cinematic" | "energetic",
  "cinematic": boolean,
  "transitions": boolean,
  "music": boolean,
  "captions": boolean,
  "removeSilence": boolean,
  "selectBestParts": boolean
}

Rules:

- Instagram Reels normally use 9:16.
- TikTok normally uses 9:16.
- YouTube normally uses 16:9.
- Square social media videos use 1:1.
- If the user asks for cinematic editing, cinematic must be true.
- If the user asks for transitions, transitions must be true.
- If the user asks for music, music must be true.
- If the user asks for captions or subtitles, captions must be true.
- If the user asks to remove silence or boring sections, removeSilence must be true.
- If the user asks to select highlights, best moments, or the best parts, selectBestParts must be true.
- If the user asks for energetic editing, style must be energetic.
- If the user asks for cinematic editing, style must be cinematic.
- Otherwise style must be normal.
- If a short-form video has no duration specified, use 30 seconds.
- If no duration can be determined, use 60 seconds.
- Return only JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const plan = JSON.parse(text);

    return NextResponse.json({
      success: true,
      command,
      plan,
    });
  } catch (error: any) {
    console.error("GEMINI ERROR:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to create editing plan.",
      },
      {
        status: 500,
      }
    );
  }
}