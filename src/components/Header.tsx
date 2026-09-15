import { people, setPerspective, useStore } from "@/lib/store";

function Mark() {
  return (
    <span
      aria-hidden
      className="relative inline-block"
      style={{ width: 26, height: 13, border: "1px solid #000", boxSizing: "border-box" }}
    >
      <span className="absolute bottom-0 left-0 top-0 w-1/2 bg-foreground" />
      <span
        className="absolute bottom-0 top-0"
        style={{ left: "50%", width: 1, background: "#000" }}
      />
    </span>
  );
}

export function Header() {
  const { perspective } = useStore();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-40 bg-background"
      style={{ height: 56, borderBottom: "1px solid #000" }}
    >
      <div className="mx-auto flex h-full w-full max-w-[420px] items-center justify-between px-5">
        <span className="flex items-center">
          <Mark />
          <span style={{ marginLeft: 10, fontSize: 15, fontWeight: 500 }}>beside</span>
        </span>
        <div className="flex items-center" style={{ fontSize: 15 }}>
          <button
            type="button"
            onClick={() => setPerspective("you")}
            className="flex h-11 items-center justify-center px-3"
            style={{
              opacity: perspective === "you" ? 1 : 0.35,
              transition: "opacity 180ms linear",
            }}
          >
            {people.you.name}
          </button>
          <span style={{ width: 1, height: 16, background: "#000" }} />
          <button
            type="button"
            onClick={() => setPerspective("friend")}
            className="flex h-11 items-center justify-center px-3"
            style={{
              opacity: perspective === "friend" ? 1 : 0.35,
              transition: "opacity 180ms linear",
            }}
          >
            {people.friend.name}
          </button>
        </div>
      </div>
    </header>
  );
}
