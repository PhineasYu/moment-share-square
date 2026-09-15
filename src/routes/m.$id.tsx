import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Rectangle } from "@/components/Rectangle";
import { formatDate, useStore } from "@/lib/store";

export const Route = createFileRoute("/m/$id")({
  head: () => ({
    meta: [
      { title: "A moment — Beside" },
      { name: "description", content: "One rectangle, seen full screen." },
      { property: "og:title", content: "A moment — Beside" },
      { property: "og:description", content: "One rectangle, seen full screen." },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { moments, perspective } = useStore();
  const navigate = useNavigate();
  const moment = moments.find((m) => m.id === id);

  if (!moment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <button type="button" onClick={() => navigate({ to: "/timeline" })}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div
      className="detail flex min-h-screen items-center bg-background px-5"
      onClick={() => navigate({ to: "/timeline" })}
    >
      <div className="mx-auto w-full max-w-[420px]">
        <p className="stamp-date">{formatDate(moment.initiatorCell.timestamp)}</p>
        <div className="mt-3">
          <Rectangle moment={moment} perspective={perspective} />
        </div>
      </div>
    </div>
  );
}
