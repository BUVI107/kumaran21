# QA REPORT — Kumaran's 21 (Next.js 15 / TypeScript / Tailwind v4 / Framer Motion)

Validation performed directly in a real Node.js environment (Node 22, npm
10) — every command below was actually executed against the real project,
not simulated.

## Summary

| Check                       | Result |
|------------------------------|--------|
| TypeScript Errors            | **0**  |
| Lint Errors                  | **0**  |
| Lint Warnings                 | **0**  |
| Build Errors                 | **0**  |
| Runtime Errors (page/console) | **0**  |
| Missing Assets                | **0**  |
| Broken Routes                 | **0**  |
| Failed Tests                  | **0**  |

---

## 1. TypeScript Validation

```
npx tsc --noEmit
```

Exit code `0`. No errors. (`npm run type-check` runs the same command.)

One real issue was found and fixed during development: spreading native
`ButtonHTMLAttributes` onto a Framer Motion `motion.button` produced a type
conflict on `onDrag` (Framer Motion's drag gesture prop vs. React's native
drag-event prop share a name with incompatible signatures). Fixed by giving
`Button` an explicit, narrow prop interface instead of spreading all native
button attributes — the component never needed `onDrag` etc. in the first
place.

## 2. Lint Validation

```
npx eslint .
```

Exit code `0`. **0 errors, 0 warnings.**

`eslint-config-next@15.5.19` ships its Next.js rules in the legacy
`.eslintrc`-style format (`{ extends: [...] }`), not as a flat-config array.
`create-next-app`'s default `eslint.config.mjs` (written for a flat-config
build of `eslint-config-next`) failed to import it. Fixed by using the
standard `FlatCompat` bridge from `@eslint/eslintrc` — the same pattern
Next.js itself has shipped in `create-next-app` for the 13–15 line.

## 3. Production Build Validation

```
npm run build
```

Exit code `0`. All 6 routes compiled and pre-rendered as static content:

```
Route (app)                                 Size  First Load JS
┌ ○ /                                     3.9 kB         155 kB
├ ○ /_not-found                            995 B         103 kB
├ ○ /celebration                         3.21 kB         148 kB
├ ○ /game                                6.55 kB         151 kB
├ ○ /letter                              3.68 kB         148 kB
├ ○ /memory-hall                         3.48 kB         155 kB
└ ○ /welcome                             2.22 kB         147 kB
```

**Real issue found and fixed:** `next/font/google` requires fetching font
CSS from `fonts.googleapis.com` at build time. In a network-restricted
build environment this fails outright (and it's a brittle dependency for
*any* deploy pipeline without open internet access). Fixed by self-hosting
Cormorant, Jost, and Caveat via `next/font/local`, sourced from the
open-source Google Fonts GitHub repository (OFL-licensed; license files
included in `src/fonts/`). The build is now fully offline-capable.

## 4. Runtime Validation

```
npm run dev
```

Every route was visited end-to-end with a real browser (Playwright +
Chromium), driving the actual user flow — typing the password, playing the
car game, opening the lightbox, opening the envelope, blowing out the
candle — rather than just loading each URL.

| Route | Verified |
|---|---|
| `/` (Password) | ✅ Wrong code shows error + shake; **2508** unlocks and advances |
| `/welcome` | ✅ Heading + reveal animation, "Begin The Journey" advances |
| `/game` | ✅ Drives, HUD updates, traffic spawns/collides, win + skip both advance |
| `/memory-hall` | ✅ All 7 story cards + 3 cinematic cards + 2 friendship cards render; lightbox opens/closes |
| `/letter` | ✅ Envelope opens, all 10 paragraphs + signature fade in line by line, continue advances |
| `/celebration` | ✅ Candle blows out, fade to dark, gold finale headline + confetti burst/rain |

**Two real bugs were found this way and fixed:**

1. **Route guard silently failed.** The guard hook's parameter was named
   `require` — which shadows a special identifier inside webpack's module
   system. It compiled fine and produced no error, but the guard never
   redirected. Renamed to `requirement`; verified with a fresh (no
   localStorage) browser context that all five protected routes now
   correctly bounce an unauthenticated visit back to `/`.
2. **Finale headline rendering bug.** `background-clip: text` (the gold
   gradient effect) combined with a `<sup>` element and color-emoji glyphs
   inside the same gradient-clipped element caused the `st` in "21st" to
   render invisible and desaturated the 🎉 emoji, in Chromium. Fixed by
   moving the emoji and the ordinal suffix outside the gradient-clipped
   span entirely, styling them with a plain solid gold color instead.
   Verified visually before/after.

Console output across the full run: zero page errors, zero uncaught
exceptions. The only console messages at all are two expected `404`s for
`piano.mp3` / `celebration.mp3` (see Asset Validation below) — both are
caught in code and fail silently by design.

## 5. Asset Validation

- All 11 original uploaded photos are present under `public/images/`,
  resized/compressed for the web (none altered in content, none
  AI-generated), and confirmed loading with no broken `<img>`/`next/image`
  requests anywhere in the app.
- No missing imports, no missing files. `npm run build`'s static
  prerendering would fail on a missing import or asset reference — it
  didn't.
- **Known, intentional gap:** `public/audio/piano.mp3` and
  `public/audio/celebration.mp3` are not included — no royalty-free or
  user-supplied track was provided to ship. Both `<audio>` elements
  reference these paths and the code calls `.catch()` on `.play()`, so the
  experience is fully silent-safe with no console-breaking errors; only a
  benign `404` in the network tab until real files are added (see README).

## 6. Mobile / Tablet / Desktop Validation

Tested at 390×844 (mobile), 834×1194 (tablet), and 1400×900 (desktop) with
Playwright, through the full user flow on each:

- **No horizontal scrolling** on any route at any breakpoint
  (`document.documentElement.scrollWidth > clientWidth` checked
  programmatically — `false` on every page tested).
- Password split layout collapses to a stacked layout under 880px; Memory
  Hall grid reflows via `auto-fit`; car game canvas and touch controls
  scale to the viewport; letter card and cake scale down on small screens.

## 7. Animation Validation

- Framer Motion drives all DOM-level transitions (page reveals, password
  shake, envelope opening, letter line-by-line stagger, Memory Hall
  scroll-reveals, lightbox enter/exit, candle blow-out, finale reveal).
  Canvas-based systems (ambient embers, confetti, the car game) correctly
  use `requestAnimationFrame` directly — Framer Motion does not animate
  canvas pixel content, so this is the correct approach, not a gap.
- `prefers-reduced-motion: reduce` is respected globally (animation/
  transition durations collapse to near-zero).
- No animation-related console warnings or errors observed in any of the
  Playwright runs above.

## 8. Final QA Checklist

- [x] Password **2508** works (and only 2508)
- [x] Car game is playable (keyboard, touch buttons, and swipe), has a
      working win condition and a skip option
- [x] Memory Hall opens and all photos display (7 story + 3 cinematic + 2
      friendship = all 11 unique source photos accounted for, the portrait
      is additionally used on the password page)
- [x] Letter opens with the exact, unmodified text and the "— Kasin 💙"
      signature
- [x] Birthday celebration page loads
- [x] Cake/candle interaction works (click or tap the flame)
- [x] Final gold message displays: "HAPPY 21st BIRTHDAY KUMARAN" with
      confetti

---

## Known, disclosed non-blockers

- `npm audit` reports 2 moderate advisories, both for a `postcss` version
  bundled **inside** `next`'s own internal build tooling (not part of the
  shipped client bundle, not in the request-handling path of this static
  site). `npm audit fix --force` would downgrade Next.js to `9.3.3` to
  "fix" this — i.e., it isn't a real fix, just `npm`'s blunt suggestion. No
  action taken; flagged here for transparency rather than hidden.
- Two `<audio>` elements will show a `404` in the browser network tab until
  real audio files are supplied (see README — this is intentional; no
  placeholder/stock audio was fabricated).
