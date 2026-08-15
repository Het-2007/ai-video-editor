import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const command = body.command;

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        {
          error: "Command is required",
        },
        {
          status: 400,
        }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",

      input: [
        {
          role: "system",
          content: `
You are an AI video editing assistant.

Your job is to understand a user's natural language video editing request and convert it into a structured editing plan.

The plan will later be executed by a video processing system using FFmpeg.

Understand commands such as:
- Instagram reels
- YouTube videos
- TikTok videos
- cinematic videos
- short videos
- long videos
- remove silence
- remove boring parts
- select best clips
- transitions
- background music
- captions
- subtitles
- vertical videos
- landscape videos
- square videos
- slow motion
- energetic editing
- cinematic editing

Rules:

1. duration must be a number in seconds.
2. Use 30 seconds when the user asks for a short reel but doesn't specify a duration.
3. Use 60 seconds when no duration can reasonably be determined.
4. Instagram Reels and TikTok should normally use 9:16.
5. YouTube landscape videos should normally use 16:9.
6. Square social media videos should use 1:1.
7. If the user asks for cinematic editing, cinematic should be true.
8. If the user asks for transitions, transitions should be true.
9. If the user asks for music, music should be true.
10. If the user asks for captions or subtitles, captions should be true.
11. If the user asks to remove silence or boring sections, removeSilence should be true.
12. If the user asks for the best parts/highlights, selectBestParts should be true.
13. If the user asks for energetic editing, style should be "energetic".
14. If the user asks for cinematic editing, style should be "cinematic".
15. Otherwise style should be "normal".

Return only the structured JSON requested by the schema.
          `,
        },
        {
          role: "user",
          content: command,
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "video_editing_plan",
          strict: true,
          schema: {
            type: "object",
            properties: {
              duration: {
                type: "number",
              },

              aspectRatio: {
                type: "string",
                enum: ["9:16", "16:9", "1:1"],
              },

              style: {
                type: "string",
                enum: ["normal", "cinematic", "energetic"],
              },

              cinematic: {
                type: "boolean",
              },

              transitions: {
                type: "boolean",
              },

              music: {
                type: "boolean",
              },

              captions: {
                type: "boolean",
              },

              removeSilence: {
                type: "boolean",
              },

              selectBestParts: {
                type: "boolean",
              },
            },

            required: [
              "duration",
              "aspectRatio",
              "style",
              "cinematic",
              "transitions",
              "music",
              "captions",
              "removeSilence",
              "selectBestParts",
            ],

            additionalProperties: false,
          },
        },
      },
    });

    const plan = JSON.parse(response.output_text);

    return NextResponse.json({
      success: true,
      command,
      plan,
    });
  } catch (error) {
    console.error("AI editing error:", error);

    return NextResponse.json(
      {
        error: "Failed to create editing plan",
      },
      {
        status: 500,
      }
    );
  }
}