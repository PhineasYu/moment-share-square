import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { DrumPicker } from "@/components/DrumPicker";

export const Route = createFileRoute("/window")({
  head: () => ({
    meta: [
      { title: "Beside — set a call window" },
      {
        name: "description",
        content:
          "Choose how long you are free. A quiet cylindrical picker with a click for every minute you pass.",
      },
      { property: "og:title", content: "Beside — set a call window" },
      {
        property: "og:description",
        content: "Choose how long you are free. No obligation, just a window.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CallWindow,
});

function CallWindow() {
  const [minutes, setMinutes] = useState(20);

  return (
    <div className="min-h-dvh bg-white text-black flex flex-col">
      <header className="h-14 border-b border-black flex items-center justify-between px-4">
        <Link to="/" className="text-[13px] tracking-[0.12em] uppercase">
          Back
        </Link>
        <span className="text-[13px] tracking-[0.12em] uppercase">Window</span>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-10 px-6">
        <h1 className="text-[15px] tracking-[0.04em]">I have</h1>
        <div className="w-full max-w-[280px] border-y border-black">
          <DrumPicker
            values={[5, 10, 15, 20, 30, 45, 60, 90]}
            value={minutes}
            onChange={setMinutes}
            unit="min"
            label="Call window length"
          />
        </div>
        <p className="text-[13px] tracking-[0.04em] opacity-60">
          {minutes} min window
        </p>
      </main>
    </div>
  );
}
