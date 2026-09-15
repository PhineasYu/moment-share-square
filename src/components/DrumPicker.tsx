import { useCallback, useEffect, useId, useRef } from "react";

import { haptic, initAudio, tick } from "@/lib/tick";

const ITEM_H = 44;
const STEP = 18;
const RADIUS = ITEM_H / 2 / Math.tan(((STEP / 2) * Math.PI) / 180);
const VISIBLE = 5;
const CUTOFF = 5;
const PAD = ITEM_H * 2;

export type DrumPickerProps = {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  sound?: boolean;
  label?: string;
};

export function DrumPicker({
  values,
  value,
  onChange,
  unit,
  sound = true,
  label = "Duration",
}: DrumPickerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastIdx = useRef(Math.max(0, values.indexOf(value)));
  const rafId = useRef<number | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(false);
  const baseId = useId();
  const optionId = (i: number) => `${baseId}-opt-${i}`;

  const paint = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const progress = vp.scrollTop / ITEM_H;
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const offset = i - progress;
      const abs = Math.abs(offset);
      if (abs > CUTOFF) {
        el.style.visibility = "hidden";
        continue;
      }
      el.style.visibility = "visible";
      const angle = offset * STEP;
      const rad = (angle * Math.PI) / 180;
      const scale = 1 - Math.min(abs, 4) * 0.045;
      const opacity = Math.max(0, Math.pow(Math.cos(rad), 1.3));
      el.style.opacity = String(opacity);
      el.style.transform = reduced.current
        ? `translateY(${offset * ITEM_H}px)`
        : `rotateX(${-angle}deg) translateZ(${RADIUS}px) scale(${scale})`;
      el.style.fontWeight = abs < 0.5 ? "500" : "400";
    }

    const idx = Math.max(0, Math.min(values.length - 1, Math.round(progress)));
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      vp.setAttribute("aria-activedescendant", optionId(idx));
      for (let i = 0; i < itemRefs.current.length; i++) {
        itemRefs.current[i]?.setAttribute("aria-selected", i === idx ? "true" : "false");
      }
      if (sound && !reduced.current) tick();
      haptic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound, values.length]);

  const settle = useCallback(() => {
    const idx = lastIdx.current;
    const v = values[idx];
    if (v !== undefined && v !== value) onChange(v);
  }, [onChange, value, values]);

  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const vp = viewportRef.current;
    if (!vp) return;
    const idx = Math.max(0, values.indexOf(value));
    lastIdx.current = idx;
    vp.scrollTop = idx * ITEM_H;
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onScroll = () => {
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(() => {
          rafId.current = null;
          paint();
        });
      }
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(settle, 120);
    };
    const onScrollEnd = () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settle();
    };
    const unlock = () => initAudio();
    vp.addEventListener("scroll", onScroll, { passive: true });
    vp.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => {
      vp.removeEventListener("scroll", onScroll);
      vp.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("pointerdown", unlock);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [paint, settle]);

  const goTo = (idx: number, silent = false) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    if (silent) lastIdx.current = clamped;
    vp.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      goTo(lastIdx.current + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goTo(lastIdx.current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(values.length - 1, true);
    }
  };

  return (
    <div className="drum-picker" style={{ ["--item-h" as string]: `${ITEM_H}px` }}>
      <div className="drum" aria-hidden="true" style={{ height: ITEM_H * VISIBLE }}>
        {values.map((v, i) => (
          <div
            key={v}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            className="drum-item"
          >
            {v}
            {unit ? ` ${unit}` : ""}
          </div>
        ))}
      </div>
      <div className="drum-rule drum-rule-top" aria-hidden="true" />
      <div className="drum-rule drum-rule-bottom" aria-hidden="true" />
      <div
        ref={viewportRef}
        className="drum-viewport"
        role="listbox"
        aria-label={label}
        aria-activedescendant={optionId(Math.max(0, values.indexOf(value)))}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={() => initAudio()}
        style={{ height: ITEM_H * VISIBLE }}
      >

        <div style={{ paddingTop: PAD, paddingBottom: PAD }}>
          {values.map((v, i) => (
            <div
              key={v}
              id={optionId(i)}
              role="option"
              aria-selected={v === value}
              className="drum-proxy"
              style={{ height: ITEM_H }}
            >
              {v}
              {unit ? ` ${unit}` : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
