# Shared View

Meanwhile — Lovable Build Spec

Paste this whole document into Lovable as the initial prompt. It is written for Lovable to read directly.

1. What we are building

Meanwhile is a prototype for a two-person app. Two friends who live far apart share one rectangle. The rectangle is split into two squares: the left square is one person's moment, the right square is the other's. A moment is a photo taken right now, or a single large emoji.

The whole point is that there is no obligation to reply. Sending is already complete on its own. The second square is an invitation, never a debt.

Build this as a front-end prototype with local state and seed data. No backend, no auth, no database, no real push notifications. It must run entirely in the browser and be demo-able on a phone screen.

2. Design system

This is a deliberate, austere black-and-white system. Follow it exactly — do not add color, softness, or decoration.

Color

Token Value Use --ink #000000 All borders, all text --paper #FFFFFF All backgrounds, empty cells

Two colors only. No greys, no tinted blacks (#111, #0B0B0B are forbidden), no accent color, no gradients, no shadows.

Borders

Every square and rectangle is outlined with 2px solid var(--ink).

The divider between the two squares is also 2px solid var(--ink).

border-radius: 0 everywhere, with no exceptions.

Borders are the only structural device in this UI. There are no cards, no panels, no elevation.

Type

One typeface throughout: General Sans (Fontshare). Fallback: Archivo from Google Fonts, then system-ui, sans-serif.

Weights: 400 for everything, 500 only for the logotype.

Sentence case everywhere. Do not use all-caps labels.

Do not use a monospace font anywhere.

Timestamps are set in the same family as everything else, at 13px, letter-spacing 0.01em.

Layout

Mobile-first, max content width 420px, centered on larger screens.

Page margin: 20px left and right.

The rectangle is always 2:1 — width 100% of the content column, height exactly half that width. Each square inside is 1:1.

Generous vertical whitespace. Nothing is crowded. Let the frames sit in empty space.

Motion

One motion moment only: the pairing animation (spec'd in §6). Do not add fade-and-slide-up entrances, hover transitions on every element, or page-load sequences. Respect prefers-reduced-motion by snapping instantly to the paired state.

Logo

Top-left of the header. It is the product mark itself: a 2:1 rectangle, 28px wide × 14px tall, 2px solid #000 outline, with a 2px vertical divider at the midpoint. The left square is filled solid black; the right square is white. Beside it, the wordmark meanwhile in lowercase, 15px, weight 500, 10px to the right of the mark.

3. Data model (local state / seed JSON)

type Person = {
  id: string;          // "you" | "friend"
  name: string;        // "You" | "Mei"
  city: string;        // "Stockholm" | "Guangzhou"
}

type Cell = {
  kind: "photo" | "emoji";
  photoUrl?: string;   // object URL or seed image
  emoji?: string;      // single emoji character
  timestamp: string;   // ISO datetime, LOCAL to that person
  city: string;
}

type Moment = {
  id: string;
  initiator: "you" | "friend";  // who opened this rectangle
  initiatorCell: Cell;          // always present
  responderCell: Cell | null;   // null = not yet paired
}


Ordering rule: the timeline is sorted by initiatorCell.timestamp, newest first. The rectangle's canonical date is always the initiator's timestamp — a response that lands six hours later does not move the rectangle.

4. The rectangle — all four states

This is the heart of the product. Get these exactly right.

State A — Sent, viewed by the sender

The initiator's photo fills the entire 2:1 rectangle, edge to edge, object-fit: cover.

No divider. No empty cell. No plus icon. No placeholder.

One timestamp, bottom-left.

Nothing in this view may suggest something is missing or pending. For the sender, this moment is finished.

┌──────────────────────────────────┐
│                                  │
│        my photo, full bleed      │
│ 15:04 Stockholm                  │
└──────────────────────────────────┘


State B — Sent, viewed by the receiver

Split 50 / 50. Left square = the sender's photo. Right square = empty white with a centered plus.

The plus is a plain + glyph drawn as two 2px black strokes, 20px long, centered. No circle around it, no icon library, no button chrome.

The empty cell has the same 2px black border as everything else.

The empty cell breathes: opacity oscillates between 1 and 0.45 over 2.4s, ease-in-out, infinite. This is the one ambient motion allowed, and only here, and only on the newest moment.

┌────────────────┬─────────────────┐
│                │                 │
│  their photo   │        +        │
│ 21:37 Guangzhou│                 │
└────────────────┴─────────────────┘


State C — Paired

Split 50 / 50. Both squares filled with photos. Each square carries its own timestamp and city, bottom-left of that square.

┌────────────────┬─────────────────┐
│                │                 │
│   my photo     │   their photo   │
│ 15:04 Stockholm│ 21:37 Guangzhou │
└────────────────┴─────────────────┘


State D — Paired with an emoji

Identical to State C, except the responder's square is pure white with a single large emoji centered, font-size = 46% of the square's height. The timestamp still appears bottom-left of that square, in black.

An emoji reply fills its square as completely as a photo does. It must never look like less.

Timestamp rendering

Format: 15:04 Stockholm — 24-hour time, then a space, then the city. No date on the rectangle itself.

Position: 10px from the left edge, 10px from the bottom edge, of its own square (or of the whole rectangle in State A).

Rendering: color: #FFF; mix-blend-mode: difference; so it stays legible over any photo while keeping the palette strictly black and white. Over the white emoji cell this makes it read as black — correct.

The full date (2026.09.15) appears above the rectangle in the timeline, not on the image.

5. Screens

5.1 Header (persistent, all screens)

Left: the logo mark + meanwhile wordmark.

Right: a perspective toggle — two text labels, You and Mei, separated by a 2px black vertical rule, the active one at full opacity and the inactive at 0.35. Tapping switches whose eyes you are seeing through.

This toggle is a demo affordance, not a real product feature. Keep it, it is needed to show both sides of the rectangle live.

Below the header, a 2px full-bleed black rule.

5.2 Now (home, default route /)

The most recent moment, rendered large at the top, in whichever of States A–D applies to the currently selected perspective.

The date sits above it, left-aligned: 2026.09.15.

Below it, 32px down, a single line of plain text: Take one — tapping it opens the Add sheet. If the current perspective already has a filled cell in this moment, this line reads Start a new one instead.

Below that, the top ~20% of the next timeline rectangle peeks above the fold, to signal scrollability. Scrolling down navigates to Timeline.

5.3 Add sheet (bottom sheet over Now)

Opens when the user taps the empty + cell, or taps Take one.

Three options, stacked as full-width rows separated by 2px black rules:

Take a photo — opens the device camera via <input type="file" accept="image/*" capture="environment">

Choose a photo — plain file input (for demo convenience on desktop)

Send an emoji — reveals a row of 8 emoji: 🙂 🥲 😂 🫶 👀 🌙 ☕️ 🚶

Tapping any option immediately commits the moment and closes the sheet. There is no confirm step, no caption field, no preview-and-edit screen. Friction here defeats the product.

5.4 Timeline (route /timeline)

Vertical scroll, one rectangle centered at a time, using CSS scroll-snap-type: y mandatory on the container and scroll-snap-align: center on each item.

Each item: the date above it, then the rectangle. 64px of empty space between items.

Unpaired moments appear here in State A regardless of perspective — full-bleed single photo, no plus, no empty cell, no divider. Same visual weight as a paired rectangle.

The + appears only on the single newest moment, and only when the current perspective has not filled their cell. Historical unpaired moments never show a plus. The timeline is a record, not a to-do list.

No counters, no "3 months since you last paired", no streaks, no activity score, no sorting controls, no filters.

5.5 Moment detail (optional, route /m/:id)

Tapping a rectangle opens it full-screen on a white background, same 2:1 proportion, with both timestamps shown larger. Tap anywhere to dismiss. Build this only after everything above works.

6. The pairing animation

When the responder commits their cell, animate the transition from State B to State C/D on screen:

The sender's photo scales from 100% to 50% of the rectangle's width, anchored left.

Simultaneously, the responder's cell slides in from the right edge.

Duration 280ms, easing cubic-bezier(0.22, 1, 0.36, 1), with a 4px overshoot that settles — the two squares should feel like they click into place, not fade.

The 2px divider appears at the end of the motion, not during it.

This is the single memorable moment of the prototype. It should be smooth at 60fps on a phone.

7. Seed data (required for the demo)

Preload 8 moments so the timeline is full on first open. Use placeholder images — quiet, ordinary, unstaged scenes (a street, a table, a window, a bus). Avoid glossy stock photography.

# Initiator Initiator time Responder Responder time State 1 you 2026.09.15 15:04 Stockholm — — unpaired (newest, shows + to Mei) 2 friend 2026.09.09 22:10 Guangzhou you 2026.09.09 16:31 Stockholm paired, photo 3 you 2026.08.28 08:12 Stockholm friend 2026.08.28 15:02 Guangzhou paired, emoji 🫶 4 you 2026.08.14 19:40 Stockholm — — unpaired 5 friend 2026.07.30 07:55 Guangzhou you 2026.07.30 08:20 Stockholm paired, photo 6 you 2026.07.11 13:22 Stockholm friend 2026.07.11 20:05 Guangzhou paired, photo 7 friend 2026.06.19 23:41 Guangzhou you 2026.06.20 09:02 Stockholm paired, emoji 😂 8 you 2026.05.31 17:15 Stockholm friend 2026.05.31 23:48 Guangzhou paired, photo

Two unpaired moments are intentional. They stay in the record, unannotated.

8. Do not build

Lovable tends to add these by default. None of them belong here.

Interaction

Read receipts, "seen" indicators, typing indicators, delivery status

Streaks, daily counters, "you haven't paired in N days"

Unread badges, red dots, notification counts

Like counts, reaction counts, comment threads

Any copy that frames an empty cell as waiting, pending, overdue, or missed

Infinite scroll without snap

A plus on any moment other than the newest

Confirm/preview steps between choosing a photo and committing it

Visual

Rounded corners, drop shadows, gradients, blurs, glassmorphism

Any color other than pure black and pure white

Icon libraries (lucide, heroicons, etc.) — the only glyph is the +, drawn as two strokes

All-caps labels, eyebrow labels above headings, → appended to link text

Middle-dot meta strings (A · B · C)

Skeleton loaders, spinners, toasts

Scope

Login, signup, accounts, invites, onboarding flow

Backend, database, real-time sync

Music links, video, WhatsApp/FaceTime integration

Settings, profile pages, dark mode

9. Build order

Design tokens, header, logo mark

The <Rectangle> component with all four states, driven by props

Now screen with the perspective toggle, wired to seed data

Add sheet with camera + emoji, committing to local state

Pairing animation

Timeline with scroll-snap

Moment detail (only if time remains)

Ship each step working before starting the next.

Name: Beside

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://moment-share-square.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/41327347-23c9-4bc7-9779-530b957ddb2e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
