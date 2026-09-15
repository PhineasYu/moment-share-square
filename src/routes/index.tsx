import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AddSheet } from "@/components/AddSheet";
import { Header } from "@/components/Header";
import { Rectangle } from "@/components/Rectangle";
import { canRespond, cellOf, formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beside — one rectangle, two people" },
      {
        name: "description",
        content:
          "Beside is a quiet two-person app. Share a photo or a single emoji. A reply is an invitation, never a debt.",
      },
      { property: "og:title", content: "Beside — one rectangle, two people" },
      {
        property: "og:description",
        content:
          "Beside is a quiet two-person app. Share a photo or a single emoji. A reply is an invitation, never a debt.",
      },
    ],
  }),
  component: Now,
});

function Now() {
  const { moments, perspective, justPairedId } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();
  const sentinel = useRef<HTMLDivElement>(null);

  const newest = moments[0]!;
  const next = moments[1];
  const mine = cellOf(newest, perspective);
  const canAnswer = canRespond(newest, perspective);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 120) navigate({ to: "/timeline" });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-[420px] px-5">
        <h1 className="sr-only">Beside</h1>
        <p className="stamp-date pt-10">{formatDate(newest.initiatorCell.timestamp)}</p>
        <div className="mt-3">
          <Rectangle
            moment={newest}
            perspective={perspective}
            showPlus={canAnswer}
            onPlus={() => setSheetOpen(true)}
            animatePair={justPairedId === newest.id}
          />
        </div>

        <button type="button" className="mt-8 block text-left" onClick={() => setSheetOpen(true)}>
          {mine ? "Start a new one" : "Take one"}
        </button>

        {next ? (
          <div className="mt-16">
            <p className="stamp-date">{formatDate(next.initiatorCell.timestamp)}</p>
            <div className="mt-3 h-[26vw] max-h-[105px] overflow-hidden">
              <Rectangle moment={next} perspective={perspective} />
            </div>
          </div>
        ) : null}

        <div ref={sentinel} className="h-24" />
      </main>

      <AddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
