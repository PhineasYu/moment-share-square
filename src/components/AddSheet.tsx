import { useEffect, useRef, useState } from "react";

import { DrumPicker } from "@/components/DrumPicker";
import { commit } from "@/lib/store";

const EMOJI = ["🙂", "🥲", "😂", "🫶", "👀", "🌙", "☕️", "🚶"];

export function AddSheet({
  open,
  onClose,
  onWindow,
}: {
  open: boolean;
  onClose: () => void;
  onWindow?: (minutes: number) => void;
}) {
  const [mounted, setMounted] = useState(open);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [minutes, setMinutes] = useState(20);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const t = setTimeout(() => {
      setMounted(false);
      setEmojiOpen(false);
      setWindowOpen(false);
    }, 220);
    return () => clearTimeout(t);
  }, [open, mounted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    commit({ kind: "photo", photoUrl: URL.createObjectURL(file) });
    onClose();
  };

  const row = "pressable flex w-full items-center px-5 text-left";

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className={`relative mx-auto w-full max-w-[420px] bg-background ${open ? "sheet-in" : "sheet-out"}`}
        style={{ borderTop: "1px solid #000" }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          startY.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchMove={(e) => {
          const y = e.touches[0]?.clientY;
          if (startY.current !== null && y !== undefined && y - startY.current > 40) onClose();
        }}
      >
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <button
          type="button"
          className={row}
          style={{ height: 56 }}
          onClick={() => cameraRef.current?.click()}
        >
          Take a photo
        </button>
        <div style={{ height: 1, background: "#000" }} />
        <button
          type="button"
          className={row}
          style={{ height: 56 }}
          onClick={() => fileRef.current?.click()}
        >
          Choose a photo
        </button>
        <div style={{ height: 1, background: "#000" }} />
        <button
          type="button"
          className={row}
          style={{ height: 56 }}
          aria-expanded={emojiOpen}
          onClick={() => setEmojiOpen((v) => !v)}
        >
          Send an emoji
        </button>

        <div className={`emoji-row ${emojiOpen ? "open" : ""}`}>
          <div style={{ height: 1, background: "#000" }} />
          <div className="emoji-row-inner flex items-center justify-between px-5" style={{ height: 55 }}>
            {EMOJI.map((glyph) => (
              <button
                key={glyph}
                type="button"
                className="flex h-11 w-11 items-center justify-center"
                style={{ fontSize: 28, lineHeight: 1 }}
                tabIndex={emojiOpen ? 0 : -1}
                onClick={() => {
                  commit({ kind: "emoji", emoji: glyph });
                  onClose();
                }}
              >
                {glyph}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: "#000" }} />
        <button
          type="button"
          className={row}
          style={{ height: 56 }}
          aria-expanded={windowOpen}
          onClick={() => setWindowOpen((v) => !v)}
        >
          I have time
        </button>

        {windowOpen ? (
          <>
            <div style={{ height: 1, background: "#000" }} />
            <div className="px-5 py-6">
              <DrumPicker
                values={[5, 10, 15, 20, 30, 45, 60, 90]}
                value={minutes}
                onChange={setMinutes}
                unit="min"
                label="Call window length"
              />
              <button
                type="button"
                className="pressable mt-6 flex w-full items-center justify-center"
                style={{ height: 48, border: "1px solid #000", fontSize: 15 }}
                onClick={() => {
                  onWindow?.(minutes);
                  onClose();
                }}
              >
                I&apos;m free for {minutes} min
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
