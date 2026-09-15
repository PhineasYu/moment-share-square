import { useEffect, useLayoutEffect, useRef } from "react";

import { Rectangle } from "@/components/Rectangle";
import { type Moment, type PersonId, formatDate } from "@/lib/store";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function Detail({
  moment,
  perspective,
  from,
  onClose,
}: {
  moment: Moment;
  perspective: PersonId;
  from: DOMRect;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const to = el.getBoundingClientRect();
    const scale = from.width / to.width;
    el.animate(
      [
        {
          transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})`,
        },
        { transform: "translate(0px, 0px) scale(1)" },
      ],
      { duration: 320, easing: EASE, fill: "none" },
    );
  }, [from]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const el = ref.current;
    if (!el) {
      onClose();
      return;
    }
    const to = el.getBoundingClientRect();
    const scale = from.width / to.width;
    const anim = el.animate(
      [
        { transform: "translate(0px, 0px) scale(1)", opacity: 1 },
        {
          transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})`,
          opacity: 1,
        },
      ],
      { duration: 320, easing: EASE, fill: "forwards" },
    );
    anim.onfinish = onClose;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Close moment"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-5"
      onClick={close}
    >
      <div ref={ref} className="w-full max-w-[720px]" style={{ transformOrigin: "top left" }}>
        <p className="detail-date pb-3">{formatDate(moment.initiatorCell.timestamp)}</p>
        <Rectangle moment={moment} perspective={perspective} detail />
      </div>
    </div>
  );
}
