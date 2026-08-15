import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const command = body.command;

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        {
          error: "Command is required.",
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an AI video editing assistant.

Convert the user's natural-language video editing command into a structured editing plan.

User command:
${command}

Return ONLY valid JSON.

The JSON must contain exactly these fields:

{
  "duration": 30,
  "aspectRatio": "9:16",
  "style": "energetic",
  "cinematic": false,
  "transitions": true,
  "music": true,
  "captions": true,
  "removeSilence": true,
  "selectBestParts": true
}

Rules:

- Instagram Reels normally use 9:16.
- TikTok normally uses 9:16.
- YouTube videos normally use 16:9.
- Square videos use 1:1.
- If the user asks for cinematic editing, cinematic must be true.
- If the user asks for transitions, transitions must be true.
- If the user asks for music, music must be true.
- If the user asks for captions or subtitles, captions must be true.
- If the user asks to remove silence or boring sections, removeSilence must be true.
- If the user asks for highlights, best moments, or best parts, selectBestParts must be true.
- If the user asks for energetic editing, style must be energetic.
- If the user asks for cinematic editing, style must be cinematic.
- Otherwise style must be normal.
- If a short-form duration is not specified, use 30 seconds.
- If no reasonable duration can be determined, use 60 seconds.
`;

    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: prompt,
      store: false,
    });

    const outputText = interaction.output_text;

    if (!outputText) {
      throw new Error("Gemini returned an empty response.");
    }

    const cleanedText = outputText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const plan = JSON.parse(cleanedText);

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
      { status: 500 }
    );
  }
}