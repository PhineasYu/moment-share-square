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
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary_large_image" },
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

  // Wheel: the moment at centre is full size; others shrink and tilt away like a ring.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = root.getBoundingClientRect();
      const cy = r.top + r.height / 2;
      itemRefs.current.forEach((el, id) => {
        if (id === "today") {
          // Today's slot is the anchor: always full width, never shrinks.
          el.style.transform = "none";
          el.style.opacity = "1";
          return;
        }
        const b = el.getBoundingClientRect();
        const d = Math.max(-1.6, Math.min(1.6, (b.top + b.height / 2 - cy) / (r.height / 2)));
        const a = Math.abs(d);
        if (reduce) {
          el.style.opacity = String(1 - Math.min(a, 1) * 0.3);
          return;
        }
        // Ferris wheel: cards stay upright — no tilt, only depth (scale) and a gentle pull toward centre.
        const s = 1 - Math.min(a, 1.2) * 0.2;
        el.style.transform = `translate3d(0, ${-d * 14}px, 0) scale(${s})`;
        el.style.opacity = String(Math.max(0.5, 1 - a * 0.4));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
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
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0, #000 72px, #000 calc(100% - 48px), transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0, #000 72px, #000 calc(100% - 48px), transparent 100%)",
        }}
      >
        <div
          className="mx-auto w-full max-w-[420px] px-5 pt-10"
          style={{ paddingBottom: "max(25vh, calc(50vh - 56px - 110px))" }}
        >
          <p className="beside-reflection mb-8">
            When you cross my mind,
            <br />
            what is unfolding beneath your sky?
          </p>
          <div
            data-id="today"
            ref={(el) => register("today", el)}
            className={`focusable ${activeId === "today" ? "is-active" : ""}`}
            style={{ scrollSnapAlign: "center", marginBottom: 24 }}
          >
            <p className="stamp-date pb-3">{formatDate(new Date().toISOString())}</p>
            <button
              type="button"
              aria-label="Add today's moment"
              className="pressable today-slot relative block w-full"
              onClick={() => setSheetOpen(true)}
            >
              <span className="plus" aria-hidden />
            </button>
          </div>

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
                style={{ scrollSnapAlign: "center", marginBottom: 24 }}
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
        style={{ height: 56 }}
      >
        <button
          type="button"
          className="pressable flex h-full w-full items-center justify-center"
          style={{ fontSize: 15 }}
          onClick={() => setSheetOpen(true)}
        >
          {freeFor === null ? "Start a new one" : `Start a new one · free for ${freeFor} min`}
        </button>
      </footer>

      <AddSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onWindow={(m) => setFreeFor(m)}
      />

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
