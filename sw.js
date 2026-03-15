// Service Worker legado — substituído pelo App Router do Next.js.
// Este arquivo limpa caches antigos e serve como passthrough sem armazenar nada novo.
// TODO: substituir por next-pwa ou Workbox configurado para o App Router se PWA for necessário.

const LEGACY_CACHE_NAME = 'historico-universitario-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.map(cache => caches.delete(cache)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request))
})
