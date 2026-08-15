import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No video file was provided." },
        { status: 400 }
      );
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        {
          error:
            "Cloudinary environment variables are missing.",
        },
        { status: 500 }
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        {
          error: "Only video files are allowed.",
        },
        { status: 400 }
      );
    }

    const cloudinaryForm = new FormData();

    cloudinaryForm.append("file", file);
    cloudinaryForm.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    );

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          error:
            "Cloudinary returned an invalid response.",
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error("CLOUDINARY ERROR:", data);

      return NextResponse.json(
        {
          error:
            data.error?.message ||
            "Cloudinary upload failed.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.secure_url,
      publicId: data.public_id,
      duration: data.duration,
      format: data.format,
      width: data.width,
      height: data.height,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while uploading the video.",
      },
      { status: 500 }
    );
  }
}