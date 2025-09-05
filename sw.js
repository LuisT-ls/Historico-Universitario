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

// Handler para notificações push
self.addEventListener('push', event => {
  console.log('Push event received:', event)

  const options = {
    body: event.data
      ? event.data.text()
      : 'Nova notificação do Histórico Universitário',
    icon: '/assets/img/favicon/favicon-32x32.png',
    badge: '/assets/img/favicon/favicon-16x16.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalhes',
        icon: '/assets/img/favicon/favicon-16x16.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/assets/img/favicon/favicon-16x16.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Histórico Universitário', options)
  )
})

// Handler para cliques em notificações
self.addEventListener('notificationclick', event => {
  console.log('Notification click received:', event)

  event.notification.close()

  if (event.action === 'explore') {
    // Abrir a aplicação
    event.waitUntil(clients.openWindow('/'))
  } else if (event.action === 'close') {
    // Apenas fechar a notificação
    return
  } else {
    // Clique na notificação (não em uma ação específica)
    event.waitUntil(clients.openWindow('/'))
  }
})

// Handler para notificações fechadas
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event)
})
