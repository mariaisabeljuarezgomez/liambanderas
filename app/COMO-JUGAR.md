# 🎮 CÓMO JUGAR — How Liam Plays (for Dad)

**App:** Liam Banderas — Flag Explorer (v2, premium edition)
**Made for:** Liam (age 4, non-reader) · **Plays on:** phone or tablet
**Status:** ✅ Fully working — tested end-to-end with an automated browser

---

## 🚀 How to start (2 seconds)

1. **Double-click `PLAY.bat`** on the computer.
   - It opens a local web server and launches the app in the browser.
   - No internet required. No downloads. Everything runs offline.
2. On Liam's phone/tablet (if sharing), open the same address shown in the window.

> **Tip:** For the best experience, "Add to Home Screen" from the browser menu —
> it then opens full-screen like a real app, no address bar.

---

## 👶 What Liam does (he needs NO help)

```
   Liam taps "¡JUGAR!"  ──▶  a flag appears
                              the app SAYS its name in Spanish THEN English
                              ("México... Mexico")
                                    │
   Liam taps a color  ────▶  app says the color ("Verde... Green")
   Liam taps the flag part ─▶  ✅ correct → sparkle + "¡Correcto!"
                              ❌ wrong   → gentle "try again" (never scary)
                                    │
   all parts painted  ─────▶  🎉 CONFETTI + cheers + applause + flag waves
                              "¡Lo lograste! You did it!"
                                    │
                        (waits 3–5 sec automatically)
                                    ▼
                        NEXT flag appears & speaks itself
                                    │
                  ...after 10 flags...
                                    ▼
                        🧩 QUIZ — "¿Cuál es México?"
                        4 flag photos, Liam taps the right one
                                    │
                        pass → new rank + level 2 unlocks
                        (all 50 flags across 5 levels)
```

**Liam never has to read, navigate menus, or press "next."** The app drives the whole flow automatically. There's a tiny "Siguiente / Next" button that appears if you (Dad) want to skip the wait.

---

## 🔊 Everything talks

Because Liam can't read yet, **every single thing is spoken aloud**, Spanish first then English:
- Country names · Color names · "Correct!" / "Try again" · Quiz questions · Celebrations

Tap the **🔊 speaker button** (top-right) anytime to replay the current word.

---

## ⚙️ Parent controls (the little ⚙️ gear)

- **Voice on/off** — mute the spoken words
- **Sounds on/off** — mute the sound effects (sparkle, applause, etc.)
- **Reset progress** — protected by a quick math question (so Liam can't wipe his progress by accident)

His progress saves automatically in the browser — he can stop and resume anytime.

---

## 🚪 Liam is never trapped (navigation)

Every screen now has a way out:
- **Paint station & Passport** — top-left **← back arrow** → Hub.
- **Quiz** — top-left **← Exit** → opens a parent gate (math question) → Hub. So if he's
  done mid-quiz, you can get him out. He can't leave by accident (the gate stops him).
- **Level-up / results** — a **Home** button + a full top bar.
- **Hub** is home — it has no back arrow (that's correct).

---

## 🔁 How the quiz teaches now (retry, not skip)

This is the important change: **a wrong answer never lets him move on.**
- Wrong tap → app says **"¡Incorrecto! Esa bandera es [the flag he tapped]"**,
  the card shakes, then he gets to **try again**. He repeats until he taps the right flag.
- Right tap → **"¡Correcto!"** + sparkle, then the next question.
- So every quiz gets **finished** (he can't fail or get stuck), but the app quietly
  remembers *first-try accuracy* and *how many tries* — for you, below.

---

## 📊 See how Liam is doing — the **Progreso / Progress** screen

On the Hub there's a **"Progreso"** button (parent-gated — solve the math question).
It opens a report with **four sections**:

1. **Por Nivel (By Level)** — each level's painted count, latest accuracy %, total tries, attempts.
2. **Banderas en Examen (Flags in Quiz)** — for each flag: how many tries it took, whether he
   got it on the first try, and **which flags he confused it with** (so you see exactly
   where he's struggling).
3. **Historial (History)** — a dated log of every quiz attempt: date, level, score, total tries.
   Each row has a **🗑 delete** button so you can remove old entries.
4. **Pintura (Painting)** — per flag: how many wrong colors he tried before getting it right.
   Perfect ones are highlighted.

At the bottom: **"Borrar todo el historial"** (Erase ALL history) — also parent-gated —
for when the old data no longer matters.

---

## 🎵 Background music (Liam's favorites) — with auto "ducking"

Bottom-left of every screen is a **♪ music button**. Tap it to open two big labeled buttons:
**Brainrot** and **Raining Tacos**. Tap one to play it on a loop at a gentle background level;
tap the other to switch songs; tap **Silenciar** (Stop) to turn it off.

**The clever part — ducking:** while music plays, the moment the app needs to *speak*
(country name, color, "¡Correcto!", quiz question), the music **automatically dips to a
whisper (~20%)** so Liam hears the words clearly, then **rises back up** when the voice
finishes. So he gets his songs *and* never misses a word he's supposed to learn.

> Tip: tap the song *after* the splash, on the Hub or a Paint screen. (Phones won't start
> audio until there's been a tap.) The music then keeps playing as he moves between screens.

---

## 🛠️ If something ever breaks

- **No sound?** Tap "¡JUGAR!" once — phones block audio until you tap. That tap unlocks it.
- **Music won't start?** Tap the ♪ button, then tap **Brainrot** or **Raining Tacos** (phones
  need that first tap). If you opened the app via `file://` and the song is silent, re-run
  `PLAY.bat` so it launches through the local web server (music + ducking work best there).
- **App won't load?** Close the browser, run `PLAY.bat` again.
- **Want a fresh start?** ⚙️ → "Reiniciar progreso" (solve the math question).
- **Want to clear only the history** (keep painted flags)? Progreso → "Borrar todo el historial".

---

## 📁 Where things are

| What | Where |
|---|---|
| **The app Liam plays** | `app/index.html` (launched by `PLAY.bat`) |
| **The original v1** (backup, still works) | `stitch_bilingual_flag_explorer/` |
| **The 50 flags** (all data, one file) | `app/js/data.js` |
| **The progress data + report** | `app/js/store.js`, `app/js/report.js` |
| **Liam's songs** | `music/brainrot.mp3`, `music/rainingtacos.mp3` |
| **The music engine + ducking** | `app/js/audio.js` |
| **The plan** | `PLAN.md` |

---

*Built with ❤️ for Liam. — ZCode*
