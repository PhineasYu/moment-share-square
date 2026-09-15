import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AddSheet } from "@/components/AddSheet";
import { Header } from "@/components/Header";
import { Rectangle } from "@/components/Rectangle";
import { canRespond, formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — Beside" },
      {
        name: "description",
        content: "Every rectangle you and your friend have shared, newest first. A record, not a to-do list.",
      },
      { property: "og:title", content: "Timeline — Beside" },
      {
        property: "og:description",
        content: "Every rectangle you and your friend have shared, newest first. A record, not a to-do list.",
      },
    ],
  }),
  component: Timeline,
});

function Timeline() {
  const { moments, perspective, justPairedId } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="h-screen bg-background">
      <Header />
      <div className="h-[calc(100vh-63px)] snap-y snap-mandatory overflow-y-auto">
        <main className="mx-auto w-full max-w-[420px] px-5 pb-24 pt-10">
          {moments.map((moment, i) => (
            <div key={moment.id} className={`snap-center ${i === 0 ? "" : "mt-16"}`}>
              <p className="stamp-date">{formatDate(moment.initiatorCell.timestamp)}</p>
              <div
                className="mt-3"
                onClick={() => navigate({ to: "/m/$id", params: { id: moment.id } })}
              >
                <Rectangle
                  moment={moment}
                  perspective={perspective}
                  showPlus={i === 0 && canRespond(moment, perspective)}
                  onPlus={() => setSheetOpen(true)}
                  animatePair={justPairedId === moment.id}
                />
              </div>
            </div>
          ))}
        </main>
      </div>
      <AddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
