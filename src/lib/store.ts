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
  friend: { id: "friend", name: "Mei", city: "Guangzhou" },
};

const photo = (photoUrl: string, timestamp: string, city: string): Cell => ({
  kind: "photo",
  photoUrl,
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

type State = {
  perspective: PersonId;
  moments: Moment[];
  justPairedId: string | null;
};

let state: State = {
  perspective: "you",
  moments: SEED,
  justPairedId: null,
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
  set({ perspective, justPairedId: null });
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
  const cell: Cell = {
    kind: input.kind,
    photoUrl: input.photoUrl,
    emoji: input.emoji,
    timestamp: nowStamp(),
    city: people[person].city,
  };

  const newest = state.moments[0];
  if (newest && canRespond(newest, person)) {
    set({
      moments: state.moments.map((m) => (m.id === newest.id ? { ...m, responderCell: cell } : m)),
      justPairedId: newest.id,
    });
    return;
  }

  const moment: Moment = {
    id: `m-${Date.now()}`,
    initiator: person,
    initiatorCell: cell,
    responderCell: null,
  };
  set({ moments: [moment, ...state.moments], justPairedId: null });
}

export function formatTime(timestamp: string) {
  return timestamp.slice(11, 16);
}

export function formatDate(timestamp: string) {
  return timestamp.slice(0, 10).replace(/-/g, ".");
}
