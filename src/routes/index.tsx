import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { AddSheet } from "@/components/AddSheet";
import { Detail } from "@/components/Detail";
import { Header } from "@/components/Header";
import { Rectangle } from "@/components/Rectangle";
import { type Moment, formatDate, useStore } from "@/lib/store";

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
  component: Column,
});

function Column() {
  const { moments, perspective, justPairedId, justCreatedId } = useStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [freeFor, setFreeFor] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(moments[0]?.id ?? null);
  const [detail, setDetail] = useState<{ moment: Moment; from: DOMRect } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  }, []);

  // Scroll focus — one moment at a time.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).dataset["id"];
            if (id) setActiveId(id);
          }
        }
      },
      { root, rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    itemRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [moments]);

  // A newly committed moment brings the column back to the top.
  useEffect(() => {
    if (!justCreatedId) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [justCreatedId]);

  const openDetail = (moment: Moment, el: HTMLElement | null) => {
    if (!el) return;
    setDetail({ moment, from: el.getBoundingClientRect() });
  };

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Header />
      <h1 className="sr-only">Beside</h1>

      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{
          position: "fixed",
          top: 56,
          bottom: 56,
          left: 0,
          right: 0,
          scrollSnapType: "y mandatory",
        }}
      >
        <div className="mx-auto w-full max-w-[420px] px-5" style={{ paddingTop: "25vh", paddingBottom: "25vh" }}>
          {moments.map((moment, i) => {
            const isNewest = i === 0;
            return (
              <div
                key={moment.id}
                data-id={moment.id}
                ref={(el) => register(moment.id, el)}
                className={`focusable ${activeId === moment.id ? "is-active" : ""} ${
                  justCreatedId === moment.id ? "item-enter" : ""
                }`}
                style={{ scrollSnapAlign: "center", marginBottom: 72 }}
              >
                <p className="stamp-date pb-3">{formatDate(moment.initiatorCell.timestamp)}</p>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => openDetail(moment, e.currentTarget)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openDetail(moment, e.currentTarget);
                    }
                  }}
                >
                  <Rectangle
                    moment={moment}
                    perspective={perspective}
                    isNewest={isNewest}
                    onPlus={() => setSheetOpen(true)}
                    pairing={justPairedId === moment.id}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <footer
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{ height: 56, borderTop: "1px solid #000" }}
      >
        <button
          type="button"
          className="pressable flex h-full w-full items-center justify-center"
          style={{ fontSize: 15 }}
          onClick={() => setSheetOpen(true)}
        >
          Start a new one
        </button>
      </footer>

      <AddSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      {detail ? (
        <Detail
          moment={detail.moment}
          perspective={perspective}
          from={detail.from}
          onClose={() => setDetail(null)}
        />
      ) : null}
    </div>
  );
}
