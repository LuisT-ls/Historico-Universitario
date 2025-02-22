const CACHE_NAME = 'historico-universitario-v1'
const urlsToCache = [
  './index.html',
  './assets/css/main.css',
  './assets/img/favicon/favicon-32x32.png',
  './assets/img/favicon/favicon-16x16.png',
  './js/app.js',
  './legal/terms.html',
  './legal/privacy.html'
]

// Instala o Service Worker e armazena os arquivos em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache aberto')
      return cache.addAll(urlsToCache)
    })
  )
})

// Intercepta requisições para servir os arquivos em cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request)
    })
  )
})

// Atualiza o cache quando houver mudanças
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cache)
            return caches.delete(cache)
          }
        })
      )
    })
  )
})
