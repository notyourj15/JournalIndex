const CACHE_NAME = 'health-os-v2';
const ASSETS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/babel-standalone@6/babel.min.js',
  'https://unpkg.com/dexie@3/dist/dexie.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.min.js',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/framer-motion@10.16.4/dist/framer-motion.js',
  'https://cdn.jsdelivr.net/npm/hammerjs@2.0.8',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation@3.0.1/dist/chartjs-plugin-annotation.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});