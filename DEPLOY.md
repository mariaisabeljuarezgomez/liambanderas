# 📲 DEPLOY — Get Liam Banderas onto his phone

**This app is 100% static** (HTML/CSS/JS + two MP3s). It needs **no backend,
no `requirements.txt`, no Python.** The cleanest way to get it on Liam's phone
is to host it once (on Railway, where your other sites live) and then
**"Add to Home Screen"** on his phone — it installs like a real app and
**works offline** (service worker caches everything, including his songs).

> You already push to `github.com/mariaisabeljuarezgomez/liambanderas`.
> This guide connects that repo → Railway → Liam's phone.

---

## 🚂 Part 1 — Deploy to Railway (one time, ~5 minutes)

1. **Push your code to GitHub** (the repo above). Railway reads from there.
   ```bash
   git add -A
   git commit -m "Add PWA + Railway deploy config"
   git push origin main
   ```
   > `.gitignore` keeps the heavy test tooling (puppeteer, ~170MB) out of the
   > deploy, but **includes** `app/`, `music/`, `sw.js`, `nixpacks.toml`.

2. In Railway, **New Project → Deploy from GitHub repo** → pick `liambanderas`.

3. Railway auto-detects Node (via `package.json`), installs `serve`, and runs
   `npm start`. **No settings needed** — the `nixpacks.toml` + `package.json`
   in this repo already configure it. (If Railway asks for a start command,
   it's: `serve . --no-clipboard --listen ${PORT:-3000} --no-port-switching`)

4. In **Settings → Networking → Generate Domain**. You'll get a URL like
   `https://liambanderas.up.railway.app`. Open it — you should see the splash
   screen with the spinning globe.

> **Why no `requirements.txt`?** That file is for Python apps. This one has none.
> Adding one would make Railway think it's Python and break. (Your other
> Railway sites may be Python — this one is different.)

---

## 📱 Part 2 — Install on Liam's phone (the part he uses)

**Open the Railway URL in his phone's browser ONCE, then install:**

### 🤖 Android (Chrome)
1. Open the Railway URL in Chrome.
2. Tap the **⋮ menu → Add to Home screen** (or **Install app** if prompted).
3. Name it "Liam Banderas" → **Add** → **Install**.
4. Now there's an **app icon** on his home screen. He taps it, it opens
   **full-screen like a real game** (no address bar), and works **offline**.

### 🍎 iPhone / iPad (Safari)
1. Open the Railway URL in **Safari** (must be Safari, not Chrome).
2. Tap the **Share button (▢ with ↑)** → **Add to Home Screen**.
3. **Add**. An icon appears on the home screen.
4. He taps it → opens full-screen, works offline.
   *(iOS shows an "Install" prompt too on newer versions — same result.)*

### 💡 One-time audio unlock
Phones block sound until the first tap. So the **first time** Liam opens it,
he taps the big **¡JUGAR!** button — that unlocks all audio (voices + songs).
After that it's smooth.

---

## 🔄 Updating the app later

Change code on your PC → `git push` → Railway **auto-redeploys** in ~1 min.
Liam's phone gets the update next time he opens it (the service worker fetches
the new version in the background).

> If you ever need to force Liam's phone to refresh: change the `CACHE` name
> in `sw.js` (e.g. `liam-banderas-v1` → `v2`) before pushing. That tells
> every phone "new version — refresh."

---

## ✅ What I already verified (automated tests)

I simulated the **exact** Railway deploy locally — `npm install --omit=dev`
(skips the heavy test tooling) + `serve` + full app test — and it passed:
- ✅ Root URL redirects to `/app/` correctly (relative paths resolve)
- ✅ Manifest + icons load (app is installable)
- ✅ **Service worker registers** → app + music cached for **offline play**
- ✅ Full game flow works over the served `http://` URL
- ✅ `serve` is the only runtime dep; puppeteer is excluded from the deploy

Run it yourself anytime: `node scratch/simulate-deploy.js`

---

## 🧯 Troubleshooting

| Problem | Fix |
|---|---|
| Railway build fails | Make sure you pushed `package.json` + `nixpacks.toml` (they're the deploy config). No `requirements.txt` should be present. |
| Blank screen at Railway URL | Confirm the URL ends with `/` — the root auto-redirects to `/app/`. |
| "Add to Home Screen" missing on iPhone | Must use **Safari**, not Chrome/Firefox. |
| No sound on phone | He must tap **¡JUGAR!** once to unlock audio (phone rule). |
| App won't go offline | He must open it **once online** first (that's when the cache fills). After that, offline works. |
| Music silent | Tap the ♪ button → tap **Brainrot** or **Raining Tacos**. Works best over the Railway `https://` URL (Web Audio needs https, not file://). |

---

## 📦 What's actually deployed (the static files)

```
/                 ← index.html (redirects to /app/)
├── app/          ← the whole game (HTML/CSS/JS + icons + manifest)
├── music/        ← brainrot.mp3, rainingtacos.mp3
└── sw.js         ← service worker (caches everything for offline)
```

That's it. No server, no database, no Python. Just files + a tiny static file server.
