# Kumaran's 21 — A Premium Cinematic Birthday Website

A six-chapter, black-and-gold cinematic birthday experience built with
**Next.js 15**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion**.

Password gate → Welcome → Car game → Memory Hall → Letter → Birthday
celebration.

---

## Getting started

Requires **Node.js 18.18+** (Node 20+ recommended).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site is gated by a
4-digit password: **2508** (DDMM).

### Production build

```bash
npm run build
npm run start
```

### Deploying

This is a standard Next.js App Router project — it deploys as-is to Vercel,
or to any Node host that can run `next start`. No environment variables or
backend services are required; everything (state, photos, letter) is
client-side and file-based.

---

## Project structure

```
src/
  app/
    page.tsx               Password page            ("/")
    welcome/page.tsx       Welcome page             ("/welcome")
    game/page.tsx          Car game page            ("/game")
    memory-hall/page.tsx   Memory Hall page         ("/memory-hall")
    letter/page.tsx        Letter page              ("/letter")
    celebration/page.tsx   Birthday celebration     ("/celebration")
    layout.tsx             Root layout, fonts, providers
    globals.css            Design system (colors, type, components)
  components/
    EmberField.tsx         Ambient gold-ember canvas backdrop
    ConfettiField.tsx      Confetti burst/rain canvas (finale)
    CarGame.tsx            The canvas-based highway driving game
    Lightbox.tsx           Shared fullscreen photo viewer
    Button.tsx             Shared motion-enhanced button
  context/AppStateContext.tsx  Progress state (unlocked, game completed)
  hooks/useRouteGuard.ts       Redirects direct/deep links appropriately
  data/
    memories.ts            Memory Hall photo data (typed)
    letter.ts              The letter text, paragraph by paragraph
  lib/constants.ts         Password, audio paths, route map
  fonts/                   Self-hosted Cormorant / Jost / Caveat fonts
public/
  images/                  All eleven original photos (resized for web)
  (audio/ — optional, see "Music" below; not included)
```

---

## Customizing

### The letter

Edit `src/data/letter.ts`. `LETTER_PARAGRAPHS` is an array, one entry per
paragraph — exactly as written, nothing reworded. `LETTER_SIGNATURE` is the
closing line shown at the bottom of the letter.

### Memory Hall photos

Edit `src/data/memories.ts`:

- `MEMORIES` — the main story grid (name + caption per photo)
- `CINEMATIC_MOMENTS` — the caption-free "Moments Beyond Words" trio
- `FRIENDSHIP_PHOTOS` — the "Friendship Corner" duo

To add a new photo, drop the image file into `public/images/` and add an
entry pointing at `/images/your-file.jpg`.

### Music (optional)

Both the letter page and the celebration finale reference audio files that
aren't included (no royalty-free track was supplied, and no placeholder
audio is shipped). To add your own (licensed/owned) tracks, create:

- `public/audio/piano.mp3`
- `public/audio/celebration.mp3`

If absent, the site stays silent — nothing breaks either way.

### Password

Set in `src/lib/constants.ts` as `SITE_PASSWORD`.

### Fonts

Cormorant, Jost, and Caveat are **self-hosted** (via `next/font/local`) in
`src/fonts/`, sourced from the open-source Google Fonts repository under the
SIL Open Font License (see the included `OFL-*.txt` files). This avoids any
runtime dependency on Google's font CDN, and keeps builds fully
offline-capable.

---

## Tech notes

- **Framer Motion** drives all DOM/UI transitions: page reveals, the
  password shake, the envelope opening and line-by-line letter reveal, the
  Memory Hall scroll-reveals, the lightbox, and the candle/finale sequence.
- **Canvas + `requestAnimationFrame`** (not Framer Motion) powers the three
  pixel-particle/game systems — the ambient ember field, the confetti burst,
  and the car game itself. Framer Motion animates the DOM; it doesn't
  animate canvas pixel content, so plain `requestAnimationFrame` is the
  correct tool there, not a shortcut.
- Progress through the experience (`unlocked`, `gameCompleted`) is held in
  React context and mirrored to `localStorage`, so a refresh doesn't bounce
  you back to the password screen. Each page after the password gate uses a
  soft route guard that redirects a direct/deep link back to where the
  story actually starts.
- All eleven photos are the original uploads (resized/compressed for the
  web only — never altered in content, never AI-generated).
