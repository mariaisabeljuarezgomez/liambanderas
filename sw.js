/* ════════════════════════════════════════════════════════════════
   Service Worker — caches the whole app so Liam can play OFFLINE on
   his phone (e.g. in the car, with no signal). Lives at the repo root
   so its scope covers both /app/ (the game) and /music/ (his songs).
   ════════════════════════════════════════════════════════════════ */

const CACHE = 'liam-banderas-v2.3';

// Everything needed to run the app with no network.
const ASSETS = [
  '/',
  '/manifest.json',
  '/app/',
  '/app/index.html',
  '/app/manifest.json',
  '/app/css/premium.css',
  '/app/js/data.js',
  '/app/js/audio.js',
  '/app/js/celebrate.js',
  '/app/js/store.js',
  '/app/js/ui.js',
  '/app/js/paint.js',
  '/app/js/quiz.js',
  '/app/js/flow.js',
  '/app/js/hub.js',
  '/app/js/passport.js',
  '/app/js/report.js',
  '/app/js/settings.js',
  '/app/icons/icon-192.png',
  '/app/icons/icon-512.png',
  '/app/icons/icon-maskable-512.png',
  '/music/brainrot.mp3',
  '/music/rainingtacos.mp3',
,
  '/app/music/alarms/australia.webm',
  '/app/music/alarms/austria.webm',
  '/app/music/alarms/belgium.webm',
  '/app/music/alarms/denmark.webm',
  '/app/music/alarms/estonia.webm',
  '/app/music/alarms/finland.webm',
  '/app/music/alarms/france.webm',
  '/app/music/alarms/germany.webm',
  '/app/music/alarms/greece.webm',
  '/app/music/alarms/israel.webm',
  '/app/music/alarms/italy.webm',
  '/app/music/alarms/lithuania.webm',
  '/app/music/alarms/mexico.webm',
  '/app/music/alarms/netherlands.webm',
  '/app/music/alarms/new_zealand.webm',
  '/app/music/alarms/norway.webm',
  '/app/music/alarms/peru.webm',
  '/app/music/alarms/philippines.webm',
  '/app/music/alarms/portugal.webm',
  '/app/music/alarms/romania.webm',
  '/app/music/alarms/russia.webm',
  '/app/music/alarms/saudi_arabia.webm',
  '/app/music/alarms/sweden.webm',
  '/app/music/alarms/switzerland.webm',
  '/app/music/alarms/ukraine.webm'
];

// Install: pre-cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.all(ASSETS.map((url) =>
        cache.add(url).catch((e) => console.warn('[sw] skip', url, e.message))
      ));
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches, take control immediately.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first (so the app loads instantly offline), then network,
// and cache new GET responses for next time.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => {
        if (req.mode === 'navigate') {
          return caches.match('/app/index.html').then((res) => res || caches.match('/app/'));
        }
      });
    })
  );
});
