"use client";

import { useState } from "react";

type UploadedVideo = {
  name: string;
  url: string;
  publicId: string;
  duration?: number;
};

export default function Home() {
  const [videos, setVideos] = useState<File[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [plan, setPlan] = useState<any>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    setVideos(files);
    setUploadedVideos([]);
    setUploading(true);

    try {
      const results: UploadedVideo[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        results.push({
          name: file.name,
          url: data.url,
          publicId: data.publicId,
          duration: data.duration,
        });
      }

      setUploadedVideos(results);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Video upload failed.");
    }

    setUploading(false);
  };

  const generateEdit = async () => {
    if (uploadedVideos.length === 0) {
      alert("Please upload your videos first.");
      return;
    }

    setLoading(true);
    setPlan(null);

    try {
      const response = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command,
          videos: uploadedVideos,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create editing plan."
        );
      }

      setPlan(data.plan);
    } catch (error: any) {
      console.error(error);
      alert(
        error?.message ||
          "Something went wrong while creating the editing plan."
      );
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between border-b border-zinc-800 px-8 py-5">
        <h1 className="text-2xl font-bold">
          ✨ EditAI
        </h1>

        <button className="rounded-lg bg-white px-5 py-2 font-medium text-black transition hover:bg-zinc-200">
          Export
        </button>
      </nav>

      <div className="mx-auto max-w-7xl px-8 py-10">
        <h2 className="mb-2 text-3xl font-bold">
          Create your video
        </h2>

        <p className="mb-8 text-zinc-400">
          Upload your clips and tell AI how you want them edited.
        </p>

        <label className="flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950 transition hover:border-zinc-500">
          <div className="text-center">
            <div className="mb-4 text-5xl">
              {uploading ? "⏳" : "📤"}
            </div>

            <h3 className="text-xl font-semibold">
              {uploading
                ? "Uploading videos..."
                : "Upload your videos"}
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Select multiple video clips
            </p>
          </div>

          <input
            type="file"
            accept="video/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>

        {videos.length > 0 && (
          <section className="mt-10">
            <h3 className="mb-4 text-xl font-semibold">
              Uploaded Clips ({videos.length})
            </h3>

            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {videos.map((video, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
                >
                  <video
                    src={URL.createObjectURL(video)}
                    controls
                    className="h-40 w-full object-cover"
                  />

                  <div className="p-3">
                    <p className="truncate text-sm">
                      {video.name}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {(video.size / 1024 / 1024).toFixed(1)} MB
                    </p>

                    {uploadedVideos[index] && (
                      <p className="mt-1 text-xs text-green-500">
                        ✓ Uploaded
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">
              ✨
            </span>

            <h3 className="text-xl font-semibold">
              Tell AI what to create
            </h3>
          </div>

          <textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Example: Make a 30 second cinematic Instagram reel using the best parts of my clips..."
            className="min-h-32 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
          />

          <button
            onClick={generateEdit}
            disabled={
              !command.trim() ||
              uploadedVideos.length === 0 ||
              uploading ||
              loading
            }
            className="mt-4 rounded-xl bg-white px-7 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading
              ? "Creating plan..."
              : "✨ Generate Edit"}
          </button>

          {plan && (
            <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h3 className="mb-5 text-xl font-semibold">
                ✨ Editing Plan
              </h3>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-zinc-500">
                    Duration
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.duration} seconds
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Format
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.aspectRatio}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Style
                  </p>
                  <p className="mt-1 font-semibold capitalize">
                    {plan.style}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Cinematic
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.cinematic ? "Yes" : "No"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Transitions
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.transitions ? "Yes" : "No"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Music
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.music ? "Yes" : "No"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Captions
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.captions ? "Yes" : "No"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Remove Silence
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.removeSilence ? "Yes" : "No"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    Best Parts
                  </p>
                  <p className="mt-1 font-semibold">
                    {plan.selectBestParts ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mt-12">
          <h3 className="mb-4 text-xl font-semibold">
            Preview
          </h3>

          <div className="flex aspect-video items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="text-center text-zinc-600">
              <div className="mb-3 text-5xl">
                ▶
              </div>

              <p>
                Your edited video will appear here
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}