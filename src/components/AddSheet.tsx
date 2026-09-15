import { useRef, useState } from "react";

import { commit } from "@/lib/store";

const EMOJI = ["🙂", "🥲", "😂", "🫶", "👀", "🌙", "☕️", "🚶"];

export function AddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    commit({ kind: "photo", photoUrl: URL.createObjectURL(file) });
    setShowEmoji(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-background opacity-60" />
      <div
        className="relative mx-auto w-full max-w-[420px] border-2 border-foreground bg-background"
        onClick={(e) => e.stopPropagation()}
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
          className="w-full px-5 py-5 text-left"
          onClick={() => cameraRef.current?.click()}
        >
          Take a photo
        </button>
        <div className="h-0.5 w-full bg-foreground" />
        <button
          type="button"
          className="w-full px-5 py-5 text-left"
          onClick={() => fileRef.current?.click()}
        >
          Choose a photo
        </button>
        <div className="h-0.5 w-full bg-foreground" />
        <button
          type="button"
          className="w-full px-5 py-5 text-left"
          onClick={() => setShowEmoji(true)}
        >
          Send an emoji
        </button>

        {showEmoji ? (
          <>
            <div className="h-0.5 w-full bg-foreground" />
            <div className="flex items-center justify-between px-5 py-5">
              {EMOJI.map((glyph) => (
                <button
                  key={glyph}
                  type="button"
                  style={{ fontSize: 24 }}
                  onClick={() => {
                    commit({ kind: "emoji", emoji: glyph });
                    setShowEmoji(false);
                    onClose();
                  }}
                >
                  {glyph}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
