/* ════════════════════════════════════════════════════════════════
   Service Worker — caches the whole app so Liam can play OFFLINE on
   his phone (e.g. in the car, with no signal). Lives at the repo root
   so its scope covers both /app/ (the game) and /music/ (his songs).
   ════════════════════════════════════════════════════════════════ */

const CACHE = 'liam-banderas-v2.7';

// Everything needed to run the app with no network.
const ASSETS = [
  '/app/music/alarms/indonesia.mp3',
  '/app/music/alarms/japan.mp3',
  '/app/music/alarms/spain.mp3',
  '/app/music/alarms/canada.mp3',
  '/app/music/alarms/colombia.mp3',
  '/app/music/alarms/argentina.mp3',
  '/app/music/alarms/brazil.mp3',
  '/app/music/alarms/iceland.mp3',
  '/app/music/alarms/chile.mp3',
  '/app/music/alarms/united_states.mp3',
  '/app/music/alarms/united_kingdom.mp3',
  '/app/music/alarms/china.mp3',
  '/app/music/alarms/vietnam.mp3',
  '/app/music/alarms/turkey.mp3',
  '/app/music/alarms/india.mp3',
  '/app/music/alarms/south_africa.mp3',
  '/app/music/alarms/morocco.mp3',
  '/app/music/alarms/thailand.mp3',
  '/app/music/alarms/nigeria.mp3',
  '/app/music/alarms/ireland.mp3',
  '/app/music/alarms/egypt.mp3',
  '/app/music/alarms/south_korea.mp3',
  '/app/music/alarms/costa_rica.mp3',
  '/app/music/alarms/honduras.mp3',
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
  '/app/music/alarms/australia.mp3',
  '/app/music/alarms/austria.mp3',
  '/app/music/alarms/belgium.mp3',
  '/app/music/alarms/denmark.mp3',
  '/app/music/alarms/estonia.mp3',
  '/app/music/alarms/finland.mp3',
  '/app/music/alarms/france.mp3',
  '/app/music/alarms/germany.mp3',
  '/app/music/alarms/greece.mp3',
  '/app/music/alarms/israel.mp3',
  '/app/music/alarms/italy.mp3',
  '/app/music/alarms/lithuania.mp3',
  '/app/music/alarms/mexico.mp3',
  '/app/music/alarms/netherlands.mp3',
  '/app/music/alarms/new_zealand.mp3',
  '/app/music/alarms/norway.mp3',
  '/app/music/alarms/peru.mp3',
  '/app/music/alarms/philippines.mp3',
  '/app/music/alarms/poland.mp3',
  '/app/music/alarms/portugal.mp3',
  '/app/music/alarms/romania.mp3',
  '/app/music/alarms/russia.mp3',
  '/app/music/alarms/saudi_arabia.mp3',
  '/app/music/alarms/sweden.mp3',
  '/app/music/alarms/switzerland.mp3',
  '/app/music/alarms/ukraine.mp3'
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

