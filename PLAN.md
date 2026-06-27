# 🌍 PLAN — "Liam Banderas" Premium Bilingual Flag App (v2)

**For:** Liam (age 4) — a non-reader who learns by ear and touch.
**Made by:** ZCode, for Dad. **Date:** 2026-06-26
**Status:** ✅ BUILT & VERIFIED — full automated flow works end-to-end (headless-tested)

> **Update (Dad, read this):** the app is done and proven working. I caught & fixed
> several **show-stopping bugs through real browser testing** (not guesses) — the worst
> was that the flow controller stored flag *objects* instead of ids, so after tapping
> JUGAR **nothing happened at all**. That is now fixed along with 5 other bugs. See
> `app/COMO-JUGAR.md` for how Liam plays. The test scripts live in `scratch/`.

> **v2.1 Update (navigation + retry + progress):** you flagged that Liam got *locked
> into a quiz* with no exit, that *wrong answers passed him along silently*, and that
> there was *no way to see how he's doing*. All three are fixed (see §11 below) and
> verified with new automated tests (`scratch/e2e-v21.js`, `e2e-paint.js`).

---

## 11. 🛟 v2.1 — Navigation, retry-until-correct, & Progress tracking

You (Dad) pointed out three real problems after playing. Here's exactly what changed
and **why**, all proven by automated browser tests:

### 11.1 Navigation — Liam is never locked in again
| Before (v2) | After (v2.1) |
|---|---|
| Quiz screen had **no back/exit/home** — once a quiz started he was trapped until all 10 questions resolved | Quiz now has a **top bar with an Exit button** → opens a parent gate → returns to the Hub. He can leave any time. |
| Level-up screen had no top bar (no speaker/settings) | Level-up now has a full **top bar** (Home + speaker + settings) for consistency. |

*Why:* a 4-year-old shouldn't be trapped in a screen he can't escape — that's how
frustration (and a thrown phone) happens. The parent gate on Exit stops him leaving
by accident while still giving you an escape hatch.

### 11.2 Quiz — wrong answers now require a retry (the big one)
| Before (v2) | After (v2.1) |
|---|---|
| Wrong tap → locked the grid, auto-advanced after 2.4s, counted silently as wrong | Wrong tap → **"¡Incorrecto! Esa bandera es [name]"**, shake, then the grid **re-opens** so he tries again. He **cannot advance until he taps the correct flag.** The correct answer is *not* revealed (no free answers). |
| "Passed" = ≥ half right on first try | Every quiz is **completed** (he retries until correct), so he's never stuck/failing. But we still record **first-try accuracy** + **total tries** for the report. |

*Why:* auto-advancing past a wrong answer taught nothing — it just moved the failure
down the line. Requiring a retry turns every question into a guaranteed small win,
while the hidden accuracy number tells *you* what he actually knew. You chose
completion-based unlocking so he can never get stuck or discouraged.

### 11.3 Progress tracking + a Parent Report screen
| Before (v2) | After (v2.1) |
|---|---|
| Only booleans (`painted: true`, `quizPassed: true`) + one best-score int per level. No tries, no history, no report. | New **Progreso / Progress** screen (parent-gated, from the Hub) with **4 sections**: **1)** per-level summary (accuracy %, tries, attempts, painted/10), **2)** per-flag quiz results (tries taken, which wrong flags he confused it with, first-try?), **3)** quiz history log (dated list of every attempt), **4)** paint-station tries (wrong colors per flag). **Per-record delete** + **clear-all** (both parent-gated). |

*Why:* "did he paint it" is a yes/no. "how is he actually doing" is the question you
asked — and the answer needs tries, right/wrong, and history. The data model grew
to record `paintTries`, `quizHistory`, and per-flag `quizResults`; everything is
deletable so you can prune what's no longer useful.

### 11.4 What v2.1 added to the code
- `app/js/store.js` — expanded schema + `recordPaintTries`, `recordQuizAttempt`, `deleteQuizAttempt`, `clearAllHistory`, `getReport`.
- `app/js/quiz.js` — rewritten `answer()` (retry-until-correct) + `finish()` + an `abort()` handle for the Exit button.
- `app/js/flow.js` — quiz Exit top bar + level-up top bar + completion-based pass.
- `app/js/paint.js` — counts wrong-color taps, records them on completion.
- `app/js/ui.js` — reusable `UI.parentGate()` (used by Exit, reset, report access, clear-all).
- `app/js/report.js` — **new** parent dashboard (4 sections + delete/clear).
- `app/index.html` — `#screen-report` + loads `report.js`.
- `app/js/hub.js` — "Progreso" button (parent-gated).
- `app/css/premium.css` — report + parent-gate styling.

### 11.5 v2.1 verification (all green, zero runtime errors)
- `scratch/e2e.js` — full flow still works (13 milestones).
- `scratch/e2e-v21.js` — **wrong answer doesn't advance** ✓, **retry works** ✓, **exit returns to hub** ✓, **attempt recorded** ✓, **report renders** ✓, **delete works** ✓.
- `scratch/e2e-paint.js` — paint tries recorded (2 wrong taps → `paintTries.francia = 2`) and shown in report ✓.

---

## 12. 🎵 v2.2 — Background music with auto-ducking

You added Liam's two favorite songs (`music/brainrot.mp3`, `music/rainingtacos.mp3`) and
wanted them to play **softly in the background** but **quiet down the instant the app
speaks** so he still hears the country/color names. That technique is called **ducking**.

### What I built
- **Floating music control** (bottom-left, on every screen): tap the ♪ button → two big
  labeled buttons, **Brainrot** and **Raining Tacos**. Tap to play on loop; tap the other
  to switch; tap **Silenciar** to stop. The button turns green + pulses while playing.
- **Auto-ducking:** because *all* speech flows through one engine (`Audio2.speak`), I wired
  `duckStart()` before each phrase and `duckEnd()` after. The music **smoothly fades to
  ~20%** while a country name / color / feedback is spoken, then **fades back up** to its
  gentle background level when the voice ends. No overlap, no missed words.

### Why two audio paths (a real subtlety I handled)
Web Audio's `createMediaElementSource` treats `file://` media as **cross-origin** and
refuses to route it (silent music under the `PLAY.bat` file-fallback). So the engine
**detects the protocol**: on `http(s)://` it routes through a Web Audio **gain node** for
silky ramped fades; under `file://` it drives the element's own `.volume` with a stepped
ramp. **Ducking works both ways** — verified by an automated test (`scratch/e2e-music.js`).

### v2.2 verification (green, zero errors)
- `scratch/e2e-music.js` — widget mounts ✓, Brainrot plays + mp3 fetched ✓, music plays
  *before and after* speech (duck + restore) ✓, switch to Raining Tacos ✓, stop ✓, **zero CORS errors**.
- Full regression: `e2e.js`, `e2e-v21.js`, `e2e-music.js` all still pass.

### v2.2 files
- `app/js/audio.js` — music engine (`playMusic`/`stopMusic`/`duckStart`/`duckEnd`), dual-path volume.
- `app/js/ui.js` — `mountMusicWidget()` floating control.
- `app/index.html` — mounts the widget on startup.
- `app/css/premium.css` — music widget styling.
- `music/brainrot.mp3`, `music/rainingtacos.mp3` — your songs.

---

## 1. 🧠 What's wrong with v1 (honest diagnosis)

| Problem in v1 | Why it hurts |
|---|---|
| **50 hand-written folders**, each ~450–720 lines of copy-pasted code | Any improvement (audio, look, flow) must be redone **50 times**. That's why it feels stuck. |
| A dozen scattered `quiz_*` folders (inconsistent) | Quizzes are brittle; can't guarantee they all behave the same. |
| **No automatic flow** | The dream — *flag appears → name speaks → paint → celebrate → auto-advance → after 10, quiz* — was never wired into one connected experience. |
| Flat Tailwind look | Clean but not "spectacular/premium/3D/modern." |
| Mixed logic styles per station | Bugs hide in the inconsistencies (the handoff doc lists many). |

> **Root cause:** the app was generated **per screen** instead of **per system**. We're going to fix that.

---

## 2. 🎯 The one big idea

> **One app. All 50 flags live as DATA, not 50 copy-pasted files. One improvement instantly upgrades all 50.**

This is the difference between a prototype and a product. v2 is a **single-page app (SPA)** where:

- 🗂️ **All 50 flags are defined once** as structured data (name ES/EN, colors, paintable regions, level).
- 🎨 **One paint engine** renders any flag, listens for taps, validates colors, and celebrates.
- 🗣️ **One bilingual audio engine** speaks every word (ES → EN) + procedural sound effects (sparkle, boing, fanfare, applause).
- 🔄 **One flow controller** runs the full loop automatically.
- 🧩 **One quiz engine** serves the right quiz after every 10 flags.
- 🎉 **One celebration system** (canvas confetti, cheers, 3D waving flag).

**Your existing v1 is kept 100% intact** in `stitch_bilingual_flag_explorer/` as a backup. v2 lives in a **new** `app/` folder so nothing is destroyed.

---

## 2.5 📱 MOBILE-FIRST IS THE #1 RULE (read this first)

> **Liam plays on a PHONE / TABLET. Every layout decision starts with a small touch screen, then scales up to desktop full-screen.** Desktop is a bonus, not the target.

### Hard mobile requirements (non-negotiable)
| Requirement | How we enforce it |
|---|---|
| **Touch, not mouse** | Every interaction works by TAP. No hover-dependent UI. Use `pointer` events / `touch-action`. |
| **Giant touch targets** | Color buttons **≥72px**, quiz options **≥88px**, all buttons **≥56px**. A 4-year-old's finger is imprecise. |
| **No accidental zoom/scroll** | `viewport` with `user-scalable=no, maximum-scale=1`, `touch-action: manipulation`, `overscroll-behavior: none`, lock body scroll. |
| **No pull-to-refresh / bounce** | `overscroll-behavior: contain` + `position: fixed` app shell. |
| **Safe areas (notch / home bar)** | `env(safe-area-inset-*)` padding so nothing hides under the notch or gesture bar. |
| **Both orientations** | Paint station + quiz work in **portrait AND landscape**. Layout reflows via CSS, not JS. |
| **Audio must unlock on first tap** | Mobile browsers block audio until a user gesture. The **"¡JUGAR!"** start button unlocks the AudioContext (no silent app). |
| **No typing / no reading** | Zero text inputs. Navigation is by big icons + spoken cues. |
| **Responsive type** | `clamp()` font sizes so text is big on phones, not huge on desktop. |
| **Correct viewport height** | Use `100dvh` / `100svh` (NOT `100vh`) to avoid the mobile URL-bar resize bug. |
| **Thumb-friendly** | Primary actions (color palette, "next", quiz options) sit in the **lower 60%** of the screen — the thumb zone. |
| **Works offline** | No external CDN dependency at runtime-critical moments; everything synthesized in-browser. |

### Breakpoints (mobile-first cascade)
```css
/* DEFAULT = phone portrait (≥320px) — design here first */
@media (min-width: 600px)  { /* tablet / phone landscape */ }
@media (min-width: 900px)  { /* tablet landscape / small laptop */ }
@media (min-width: 1200px) { /* desktop — centers in a phone-frame card */ }
```

### Desktop behavior
On large screens, the app renders inside a centered **max-width ~480px "phone frame"** (so it never stretches into an awkward wide layout) OR expands gracefully for full-screen tablet use. Either way, it always *looks and feels* like the mobile app.

---

## 3. 🎬 The full experience — exactly your dream, automated

```
                         ┌─────────────────────────────┐
                         │   1. TITLE SCREEN            │
   Liam taps "JUGAR" ───▶│   logo · "¡Vamos!" · music   │
                         └──────────────┬──────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │   2. PAINT STATION (flag #1) │
                         │   • flag outline appears     │
                         │   • AUTO: "México... Mexico" │
                         │   • paint with colors        │
                         │     • correct → "¡Correcto!"  │
                         │     • wrong   → gentle retry │
                         │   • completion → CELEBRATE   │
                         └──────────────┬──────────────┘
                                        │ 3–5 sec later (AUTO)
                         ┌──────────────▼──────────────┐
                         │   3. PAINT STATION (flag #2) │
                         │   ... repeats ...            │
                         └──────────────┬──────────────┘
                                        │ after 10 flags (AUTO)
                         ┌──────────────▼──────────────┐
                         │   4. QUIZ (10 questions)     │
                         │   • "¿Cuál es... México?"    │  ← AUDIO prompt
                         │   • 4 flag thumbnails        │
                         │   • tap correct flag         │
                         │   • spoken feedback          │
                         └──────────────┬──────────────┘
                                        │ pass (AUTO)
                         ┌──────────────▼──────────────┐
                         │   5. LEVEL-UP SCREEN          │
                         │   • confetti + cheers        │
                         │   • new rank badge (3D spin) │
                         │   • "Explorer → Captain"     │
                         └──────────────┬──────────────┘
                                        │ unlocks next 10 (AUTO)
                                        ▼
                            (loop until all 50 flags mastered)
```

**Everything is automatic.** Liam never has to read or navigate menus. He just plays, and the app drives the flow. Tap-to-skip-the-wait is available for impatient parents.

---

## 4. 🎨 The premium look & feel — "spectacular & modern"

This is where we leap from "clean web page" to **premium kids' app**. Concrete techniques:

### 4.1 Visual language
- **Glassmorphism panels** — frosted, blurred, translucent cards floating over a soft gradient sky. Depth via layered blur, not flat boxes.
- **3D tactile buttons** — chunky "squishy" buttons with a real bottom-edge shadow that **compress on press** (translateY + shadow collapse). Feels like physical toys.
- **Depth & parallax** — floating clouds / stars drift at different speeds; the flag sits on a tilted "3D easel" stage.
- **Vibrant, saturated palette** — sky blue, sunny gold, grass green, friendly coral. Gold reserved for rewards.
- **Big, rounded, generous** — 48px+ touch targets, pill shapes, lots of air.

### 4.2 Motion & transitions (the "wow")
- **Page transitions** — screens slide/fade with spring physics (no jarring cuts).
- **Flag entrance** — flag outline drops in with a bouncy spring + soft shadow.
- **Paint burst** — when a region is painted correctly: a **particle burst** (stars/sparkles) emits from the tap point + a ripple.
- **Wave animation** — completed flag does a gentle **3D wave** (CSS 3D transforms) before celebration.
- **Confetti** — full-canvas particle confetti on completion + level-up.
- **Cheering** — procedural "applause + cheer" crowd sound (white-noise burst + whistle).
- **Rank badge reveal** — 3D flip + spin + shine sweep on level-up.
- **Micro-interactions** — color buttons wiggle/breathe; the speaker icon pulses while talking.

### 4.3 Sound design (fully procedural — no audio files needed)
All built with the Web Audio API so it works **100% offline**:
- `speak(es, en)` — Spanish then English TTS, warm pitch, friendly rate.
- `sparkle()` — ascending arpeggio on each correct paint.
- `boing()` — soft, non-scary "try again" tone (NOT a buzzer).
- `fanfare()` — triumphant rising chord on flag completion.
- `applause()` — procedural crowd cheer on celebration.
- `levelUp()` — magical chime cascade on level-up.
- `pop()` — light UI click.

> **No downloads, no internet, no missing files.** Everything is synthesized in-browser.

---

## 5. 🏗️ Architecture (v2)

```
LIAM BANDERAS STITCH/
├── stitch_bilingual_flag_explorer/   ← v1, UNTOUCHED (backup, still works)
├── app/                              ← ✨ v2 — the new premium app
│   ├── index.html                    ← single page, all screens
│   ├── css/
│   │   └── premium.css               ← glassmorphism, 3D, animations
│   ├── js/
│   │   ├── data.js                   ← ALL 50 flags as structured data
│   │   ├── audio.js                  ← bilingual TTS + SFX engine
│   │   ├── flow.js                   ← the automatic flow controller
│   │   ├── paint.js                  ← one paint engine for all flags
│   │   ├── quiz.js                   ← the audio quiz engine
│   │   ├── celebrate.js              ← confetti + cheers + 3D wave
│   │   └── ui.js                     ← screen transitions, effects
│   └── assets/                       ← (any SVG/icons we add)
├── PLAN.md                           ← this file
└── PLAY.bat                          ← updated to launch v2
```

**Single page, multiple "screens"** swapped via JS. No build step. No framework. Just premium vanilla JS + CSS, runnable from `file://` or any static server.

---

## 6. 🗂️ The 50 flags & 5 levels

Each flag is one data record:

```js
{ id:'mexico', es:'México', en:'Mexico', level:1,
  colors:[['verde','#006847'],['blanco','#ffffff'],['rojo','#ce1126']],
  regions:[ {id:'left',  correct:'verde'}, {id:'mid',correct:'blanco'}, {id:'right',correct:'rojo'} ],
  svg: '<svg ...>'   // paintable flag SVG with id="r-left" etc.
}
```

**Levels (10 flags each):**
- **L1 — Explorador:** México, Canadá, EE.UU., España, Francia, Italia, Alemania, Brasil, Japón, Australia
- **L2 — Aventurero:** Reino Unido, Argentina, China, India, Rusia, Colombia, Grecia, Egipto, Sudáfrica, Corea del Sur
- **L3 — Capitán:** Portugal, Países Bajos, Suecia, Suiza, Bélgica, Chile, Perú, Finlandia, Islandia, Austria
- **L4 — Navegante:** Turquía, Tailandia, Vietnam, Filipinas, Nueva Zelanda, Marruecos, Nigeria, Noruega, Israel, Arabia Saudita
- **L5 — Experto Mundial:** (final 10 / mastery review)

---

## 7. 🔊 Bilingual audio — every interaction speaks

Because Liam can't read, **everything talks**. ES first, EN second (matching your v1 convention).

| Event | What it says (ES → EN) |
|---|---|
| Flag appears | `"México... Mexico"` (auto) |
| Tap a color | `"Verde... Green"` |
| Correct paint | `"¡Correcto! ... Correct!"` |
| Wrong color | `"¡Intenta otra vez! ... Try again!"` (gentle) |
| Flag complete | `"¡Lo lograste! Pintaste la bandera de México! ... You did it! You painted Mexico's flag!"` |
| Quiz prompt | `"¿Cuál es México? ... Which one is Mexico?"` (auto, per question) |
| Quiz correct | `"¡Muy bien! ... Very good!"` |
| Quiz wrong | `"Casi. Esa era [name]. ... Almost. That was [name]."` |
| Level up | `"¡Nuevo nivel! Eres [rank]! ... New level! You're [rank]!"` |
| All 50 done | `"¡Eres un Experto Mundial! ... You're a World Expert!"` |

A floating **speaker button** re-plays the current prompt anytime.

---

## 8. ✅ Your dream checklist — how v2 meets it

| Your wish | How v2 delivers |
|---|---|
| Flag appears, name spoken **automatically** | ✅ Auto `speak(es,en)` 900ms after each flag mounts |
| Silhouette to color | ✅ Paintable SVG outlines (correct colors only, like v1) |
| Bilingual color audio | ✅ Every color tap speaks ES→EN |
| Right/wrong feedback | ✅ Gentle spoken feedback + sparkle/boing |
| Confetti, cheers, clapping on completion | ✅ Canvas confetti + procedural applause + 3D wave |
| **Auto-advance** to next flag after 3–5s | ✅ Flow controller with `autoAdvance(delay)` |
| 10 flags then **audio quiz** | ✅ Quiz fires automatically after 10; spoken prompts |
| Quiz: identify country **by audio**, not reading | ✅ Prompt spoken aloud; 4 flag options to tap |
| Another 10 → another quiz → until all 50 | ✅ 5 levels, auto-gated, persistent progress |
| **Better layout, more modern, 3D, transitions** | ✅ Glassmorphism + 3D easel + spring physics + particles |
| Spectacular & premium | ✅ That's the whole point of v2 |

---

## 9. 🛠️ Build order (what I'm doing now)

1. ✅ Write this `PLAN.md`
2. ✅ `app/index.html` — premium app shell (all screens)
3. ✅ `app/css/premium.css` — glass, 3D, animations, particles
4. ✅ `app/js/audio.js` — bilingual TTS + all SFX
5. ✅ `app/js/data.js` — all 50 flags as data + levels (validated: 10/level, 0 broken regions)
6. ✅ `app/js/paint.js` — one paint engine (renders + validates any flag)
7. ✅ `app/js/flow.js` — the automatic loop controller
8. ✅ `app/js/quiz.js` — audio quiz (spoken prompts, 4 flag options)
9. ✅ `app/js/celebrate.js` — confetti + applause + 3D wave
10. ✅ `app/js/ui.js` — screen transitions + micro-effects
11. ✅ Passport + Parent dashboard screens
12. ✅ Update `PLAY.bat` to launch v2; **verified it runs** (headless e2e test)

### 🐛 Bugs caught & fixed by real browser testing (not guesses)
| Bug | Impact | Fix |
|---|---|---|
| `buildQueue` stored flag **objects** in `queue`, but every consumer expected **ids** → `getFlag(object)` returned null | **App did nothing after tapping JUGAR** | `.map(f => f.id)` in `buildQueue` |
| `getElementById('quiz-body')` but `quiz-body` was a **class** | Quiz crashed the moment it launched | `querySelector('.quiz-body')` |
| `UI.show` left the bootstrap splash `.active` forever (no `current` set on first load) | Splash & next screen both visible at once | Hide `.screen.active` if no `current` tracked |
| Back/Home buttons called `UI.show('level')` — no such screen | Dead navigation | `UI.show('hub')` |
| Quiz `markQuizPassed` fired on **every** attempt, even a fail | Failing the quiz still unlocked the next level | Only mark passed when `correct ≥ half` |
| South Korea flag used `circle` with `w/h` not `r` | Rendered `r="undefined"` (NaN) | Added `r:42` to both discs |
| Premium polish: added orbiting-flag splash, paint ripple + "tap-me" region hints + glossy shine on correct paint, 3D tactile quiz cards | — | CSS + small JS |

### ✅ Verification (3 automated browser test suites, all green)
- `scratch/e2e.js` — basic flow: splash→hub→paint→quiz → **13 milestones, 0 errors**
- `scratch/e2e-full.js` — full loop: paint→**auto-advance to next flag**→quiz→levelup → **0 errors**
- `scratch/e2e-pass.js` — answering correctly **passes the quiz & unlocks level 2** → **0 errors**

---

## 10. 🚀 How Liam will play

1. Double-click **`PLAY.bat`** → opens the app in the browser.
2. Big **"¡JUGAR!"** button → Level 1 starts.
3. Liam hears *"México... Mexico"*, paints the flag, gets confetti + cheers.
4. 3–5s later, **next flag appears automatically** and speaks itself.
5. After 10 flags → **quiz** (all spoken). Pass → **level up** → next 10 unlock.
6. Progress saves in the browser (localStorage), so Liam can stop & resume.
7. Parent can open **Parent Dashboard** (tiny lock) to reset progress or toggle audio.

No reading required. No navigation required. Just **play, learn, celebrate, repeat**. 🎉

---

*Let's build something Liam loves. — ZCode*

## 13. ?? v2.3 � Country Alarm Sounds & Draggable Widget

You requested to add country alarm sounds sourced from the @MardekSirenen YouTube channel, and to fix the music widget so it no longer covers important parts of the screen.

### What I built
- **Draggable Music Widget:** The music widget in the bottom-left is now fully draggable using pointer events (touch and mouse). It can be moved anywhere on the screen so it doesn't block interactions.
- **YouTube Alarm Integration:** Replaced the hallucinatory AI-generated URLs with accurate ones scraped directly from @MardekSirenen.
- Added a new ?? Alarm button to the paint station.
- Added a hidden YouTube Iframe API player that triggers the alarm sound when the ?? button is clicked without leaving the app.

### Verification
- **Music Widget:** pointerdown, pointermove, pointerup events properly track movement.
- **Alarms:** Correct video IDs are triggered on the hidden iframe to play country alarms natively without CORS or external link issues.
