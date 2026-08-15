"use client";

import { useState } from "react";

export default function Home() {
  const [videos, setVideos] = useState<File[]>([]);
  const [command, setCommand] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setVideos(Array.from(e.target.files));
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between border-b border-zinc-800 px-8 py-5">
        <h1 className="text-2xl font-bold">
          ✨ EditAI
        </h1>

        <button className="rounded-lg bg-white px-5 py-2 font-medium text-black">
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
            <div className="mb-4 text-5xl">📤</div>

            <h3 className="text-xl font-semibold">
              Upload your videos
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
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">✨</span>

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
            disabled={!command.trim() || videos.length === 0}
            className="mt-4 rounded-xl bg-white px-7 py-3 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ✨ Generate Edit
          </button>
        </section>

        <section className="mt-12">
          <h3 className="mb-4 text-xl font-semibold">
            Preview
          </h3>

          <div className="flex aspect-video items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="text-center text-zinc-600">
              <div className="mb-3 text-5xl">▶</div>

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