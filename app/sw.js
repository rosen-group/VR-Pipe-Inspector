// Files to cache
const cacheName = 'vr-pipe-inspector';
const appShellFiles = [
  '/app/index.html',
  '/app/Audio.js',
  '/app/Controls.js',
  '/app/Core.js',
  '/app/GameParams.js',
  '/app/Level.js',
  '/app/main.js',
  '/app/sw.js',
  '/app/UI.js',
  '/app/vr-pipe-inspector.webmanifest',
  '/node_modules/three/build/three.module.js',
  '/node_modules/three/build/three.core.js',
  '/node_modules/three/examples/jsm/controls/PointerLockControls.js',
  '/node_modules/three/examples/jsm/webxr/VRButton.js',
  '/node_modules/three/examples/jsm/loaders/FontLoader.js',
  '/node_modules/three/examples/fonts/helvetiker_regular.typeface.json',
  '/app/res/background.mp3',
  '/app/res/pickup.wav',
  '/app/res/pipeline.png',
  '/app/res/wax.png',
  '/app/res/gulli_side.png',
  '/app/res/corosion.png',
  '/app/res/gulli.png',
  '/app/res/cracks.png',
  '/app/res/data_cloud.png',
  '/app/res/data_cloud_1.png',
  '/app/res/data_cloud_2.png',
  '/app/res/data_cloud_3.png',
  '/app/res/data_cloud_dark.png',
  '/app/res/favicon/web-app-manifest-192x192.png',
  '/app/res/favicon/web-app-manifest-512x512.png',
  '/app/res/favicon/favicon.ico',
  '/app/res/favicon/favicon.svg',
  '/app/res/favicon/favicon-96x96.png'
];

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(appShellFiles);
  })());
});

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
    // Cache http and https only, skip unsupported chrome-extension:// and file://...
    if (!(e.request.url.startsWith('http:') || e.request.url.startsWith('https:')))
    {
      return; 
    }

  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});