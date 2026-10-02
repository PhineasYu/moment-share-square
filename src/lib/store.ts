import { useSyncExternalStore } from "react";

import m1 from "@/assets/m1.jpg";
import m2 from "@/assets/m2.jpg";
import m3 from "@/assets/m3.jpg";
import m4 from "@/assets/m4.jpg";
import m5 from "@/assets/m5.jpg";
import m6 from "@/assets/m6.jpg";

export type PersonId = "you" | "friend";

export type Person = {
  id: PersonId;
  name: string;
  city: string;
};

export type Cell = {
  kind: "photo" | "emoji";
  photoUrl?: string;
  emoji?: string;
  timestamp: string;
  city: string;
};

export type Moment = {
  id: string;
  initiator: PersonId;
  initiatorCell: Cell;
  responderCell: Cell | null;
};

export const people: Record<PersonId, Person> = {
  you: { id: "you", name: "You", city: "Stockholm" },
  friend: { id: "friend", name: "Her", city: "Guangzhou" },
};

let __n = 0;
const PHOTO_IDS = [10, 11, 13, 15, 16, 17, 18, 19, 28, 29, 37, 39, 42, 48, 49, 50, 53, 54, 57, 59, 60, 63, 76, 84, 88, 96, 101, 103, 104, 106, 110, 112, 116, 119, 122, 124, 128, 129];
const next = () => `https://picsum.photos/id/${PHOTO_IDS[__n++ % PHOTO_IDS.length]}/800/800`;

const photo = (_legacy: string, timestamp: string, city: string): Cell => ({
  kind: "photo",
  photoUrl: next(),
  timestamp,
  city,
});


const emoji = (glyph: string, timestamp: string, city: string): Cell => ({
  kind: "emoji",
  emoji: glyph,
  timestamp,
  city,
});

const SEED: Moment[] = [
  {
    id: "1",
    initiator: "you",
    initiatorCell: photo(m1, "2026-09-15T15:04", "Stockholm"),
    responderCell: null,
  },
  {
    id: "2",
    initiator: "friend",
    initiatorCell: photo(m5, "2026-09-09T22:10", "Guangzhou"),
    responderCell: photo(m2, "2026-09-09T16:31", "Stockholm"),
  },
  {
    id: "3",
    initiator: "you",
    initiatorCell: photo(m3, "2026-08-28T08:12", "Stockholm"),
    responderCell: emoji("🫶", "2026-08-28T15:02", "Guangzhou"),
  },
  {
    id: "4",
    initiator: "you",
    initiatorCell: photo(m6, "2026-08-14T19:40", "Stockholm"),
    responderCell: null,
  },
  {
    id: "5",
    initiator: "friend",
    initiatorCell: photo(m1, "2026-07-30T07:55", "Guangzhou"),
    responderCell: photo(m3, "2026-07-30T08:20", "Stockholm"),
  },
  {
    id: "6",
    initiator: "you",
    initiatorCell: photo(m2, "2026-07-11T13:22", "Stockholm"),
    responderCell: photo(m4, "2026-07-11T20:05", "Guangzhou"),
  },
  {
    id: "7",
    initiator: "friend",
    initiatorCell: photo(m4, "2026-06-19T23:41", "Guangzhou"),
    responderCell: emoji("😂", "2026-06-20T09:02", "Stockholm"),
  },
  {
    id: "8",
    initiator: "you",
    initiatorCell: photo(m6, "2026-05-31T17:15", "Stockholm"),
    responderCell: photo(m5, "2026-05-31T23:48", "Guangzhou"),
  },
];

// More remembered days — enough to feel the wheel turn.
const POOL = [m1, m2, m3, m4, m5, m6];
const GLYPHS = ["🌙", "☕", "🌧️", "🍜", "🌿", "✨"];
const EXTRA: Moment[] = Array.from({ length: 12 }, (_, k) => {
  const d = new Date(Date.UTC(2026, 4, 26 - k * 4));
  const day = d.toISOString().slice(0, 10);
  const youFirst = k % 2 === 0;
  const a = youFirst ? "Stockholm" : "Guangzhou";
  const b = youFirst ? "Guangzhou" : "Stockholm";
  const reply: Cell | null =
    k % 5 === 3
      ? null
      : k % 3 === 1
        ? emoji(GLYPHS[k % GLYPHS.length]!, `${day}T21:${10 + k}`, b)
        : photo(POOL[(k + 3) % POOL.length]!, `${day}T20:${20 + k}`, b);
  return {
    id: `x${k}`,
    initiator: youFirst ? "you" : "friend",
    initiatorCell: photo(POOL[k % POOL.length]!, `${day}T0${7 + (k % 3)}:${15 + k}`, a),
    responderCell: reply,
  };
});

type State = {
  perspective: PersonId;
  moments: Moment[];
  justPairedId: string | null;
  justCreatedId: string | null;
};

let state: State = {
  perspective: "you",
  moments: [...SEED, ...EXTRA],
  justPairedId: null,
  justCreatedId: null,
};


const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export function setPerspective(perspective: PersonId) {
  set({ perspective, justPairedId: null, justCreatedId: null });
}


function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function cellOf(moment: Moment, person: PersonId): Cell | null {
  if (moment.initiator === person) return moment.initiatorCell;
  return moment.responderCell;
}

export function canRespond(moment: Moment, person: PersonId) {
  return moment.responderCell === null && moment.initiator !== person;
}

/** Commit a new cell. Responds to the newest moment when possible, else opens a new one. */
export function commit(input: { kind: "photo" | "emoji"; photoUrl?: string; emoji?: string }) {
  const person = state.perspective;
  const cell: Cell =
    input.kind === "emoji"
      ? emoji(input.emoji ?? "🙂", nowStamp(), people[person].city)
      : input.photoUrl
        ? { kind: "photo", photoUrl: input.photoUrl, timestamp: nowStamp(), city: people[person].city }   // the photo the person actually took or chose
        : photo("", nowStamp(), people[person].city);

  const newest = state.moments[0];
  if (newest && canRespond(newest, person)) {
    set({
      moments: state.moments.map((m) => (m.id === newest.id ? { ...m, responderCell: cell } : m)),
      justPairedId: newest.id,
      justCreatedId: null,
    });
    return;
  }

  const moment: Moment = {
    id: `m-${Date.now()}`,
    initiator: person,
    initiatorCell: cell,
    responderCell: null,
  };
  set({ moments: [moment, ...state.moments], justPairedId: null, justCreatedId: moment.id });
}


export function formatTime(timestamp: string) {
  return timestamp.slice(11, 16);
}

export function formatDate(timestamp: string) {
  return timestamp.slice(0, 10).replace(/-/g, ".");
}
