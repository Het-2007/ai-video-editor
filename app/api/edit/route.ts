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

Convert the user's video editing command into a structured editing plan.

User command:
${command}

Return ONLY valid JSON.

Use exactly these fields:

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

- Instagram Reels use 9:16.
- TikTok uses 9:16.
- YouTube uses 16:9.
- Square videos use 1:1.
- Cinematic request means cinematic = true.
- Transition request means transitions = true.
- Music request means music = true.
- Caption/subtitle request means captions = true.
- Remove silence/boring sections means removeSilence = true.
- Best moments/highlights means selectBestParts = true.
- Energetic request means style = energetic.
- Cinematic request means style = cinematic.
- Otherwise style = normal.
- If no short-video duration is specified, use 30 seconds.
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
      plan,
    });
  } catch (error: any) {
    console.error("GEMINI ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Gemini request failed.",
      },
      { status: 500 }
    );
  }
}