// Files to cache
const cacheName = 'vr-pipe-inspector';
const appShellFiles = [
  '/VR-Pipe-Inspector/app/index.html',
  '/VR-Pipe-Inspector/app/Audio.js',
  '/VR-Pipe-Inspector/app/Controls.js',
  '/VR-Pipe-Inspector/app/Core.js',
  '/VR-Pipe-Inspector/app/GameParams.js',
  '/VR-Pipe-Inspector/app/Level.js',
  '/VR-Pipe-Inspector/app/main.js',
  '/VR-Pipe-Inspector/app/sw.js',
  '/VR-Pipe-Inspector/app/UI.js',
  '/VR-Pipe-Inspector/app/vr-pipe-inspector.webmanifest',
  '/VR-Pipe-Inspector/node_modules/three/build/three.module.js',
  '/VR-Pipe-Inspector/node_modules/three/build/three.core.js',
  '/VR-Pipe-Inspector/node_modules/three/examples/jsm/controls/PointerLockControls.js',
  '/VR-Pipe-Inspector/node_modules/three/examples/jsm/webxr/VRButton.js',
  '/VR-Pipe-Inspector/node_modules/three/examples/jsm/loaders/FontLoader.js',
  '/VR-Pipe-Inspector/node_modules/three/examples/fonts/helvetiker_regular.typeface.json',
  '/VR-Pipe-Inspector/app/res/background.mp3',
  '/VR-Pipe-Inspector/app/res/pickup.wav',
  '/VR-Pipe-Inspector/app/res/pipeline.png',
  '/VR-Pipe-Inspector/app/res/wax.png',
  '/VR-Pipe-Inspector/app/res/gulli_side.png',
  '/VR-Pipe-Inspector/app/res/corrosion.png',
  '/VR-Pipe-Inspector/app/res/gulli.png',
  '/VR-Pipe-Inspector/app/res/cracks.png',
  '/VR-Pipe-Inspector/app/res/data_cloud.png',
  '/VR-Pipe-Inspector/app/res/data_cloud_1.png',
  '/VR-Pipe-Inspector/app/res/data_cloud_2.png',
  '/VR-Pipe-Inspector/app/res/data_cloud_3.png',
  '/VR-Pipe-Inspector/app/res/data_cloud_dark.png',
  '/VR-Pipe-Inspector/app/res/favicon/apple-touch-icon.png',
  '/VR-Pipe-Inspector/app/res/favicon/web-app-manifest-192x192.png',
  '/VR-Pipe-Inspector/app/res/favicon/web-app-manifest-512x512.png',
  '/VR-Pipe-Inspector/app/res/favicon/favicon.ico',
  '/VR-Pipe-Inspector/app/res/favicon/favicon.svg',
  '/VR-Pipe-Inspector/app/res/favicon/favicon-96x96.png'
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