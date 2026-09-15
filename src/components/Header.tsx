import { Link } from "@tanstack/react-router";

import { people, setPerspective, useStore } from "@/lib/store";

function Mark() {
  return (
    <span
      aria-hidden
      className="relative inline-block border-2 border-foreground"
      style={{ width: 28, height: 14 }}
    >
      <span className="absolute bottom-0 left-0 top-0 w-1/2 bg-foreground" />
      <span className="absolute bottom-0 left-1/2 top-0 -ml-px w-0.5 bg-foreground" />
    </span>
  );
}

export function Header() {
  const { perspective } = useStore();

  return (
    <header>
      <div className="mx-auto flex w-full max-w-[420px] items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center">
          <Mark />
          <span style={{ marginLeft: 10, fontSize: 15, fontWeight: 500 }}>meanwhile</span>
        </Link>
        <div className="flex items-center" style={{ fontSize: 15 }}>
          <button
            type="button"
            onClick={() => setPerspective("you")}
            style={{ opacity: perspective === "you" ? 1 : 0.35, paddingRight: 10 }}
          >
            {people.you.name}
          </button>
          <span className="h-4 w-0.5 bg-foreground" />
          <button
            type="button"
            onClick={() => setPerspective("friend")}
            style={{ opacity: perspective === "friend" ? 1 : 0.35, paddingLeft: 10 }}
          >
            {people.friend.name}
          </button>
        </div>
      </div>
      <div className="h-0.5 w-full bg-foreground" />
    </header>
  );
}
