import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const command = body.command;

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    const text = command.toLowerCase();

    const plan = {
      duration: text.includes("30") ? 30 : text.includes("20") ? 20 : 60,
      aspectRatio:
        text.includes("instagram") || text.includes("reel")
          ? "9:16"
          : "16:9",
      cinematic: text.includes("cinematic"),
      transitions: text.includes("transition"),
      music: text.includes("music"),
      captions:
        text.includes("caption") || text.includes("subtitle"),
      removeSilence:
        text.includes("silence") || text.includes("silent"),
    };

    return NextResponse.json({
      success: true,
      command,
      plan,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}