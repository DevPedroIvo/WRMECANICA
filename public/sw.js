// Service Worker para WR Mecânica & Cia (PWA & Offline & Notificações)
const CACHE_NAME = 'wr-mecanica-v1'

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/wr-logo.jpg',
  '/assets/real-logo.jpg',
]

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Falha ao adicionar recursos ao cache:', err)
      })
    })
  )
  self.skipWaiting()
})

// Ativação e limpeza de caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Estratégia de Fetch: Network-first com fallback para Cache
self.addEventListener('fetch', event => {
  // Ignora requisições de API ou métodos não-GET
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)

  // Ignora esquemas como chrome-extension
  if (!url.protocol.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a resposta for válida, armazena no cache para uso offline
        if (response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone).catch(() => {})
          })
        }
        return response
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request)
        if (cachedResponse) return cachedResponse
        // Se for navegação de página e estiver offline, retorna index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' })
      })
  )
})

// Clique na notificação abre o app
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/') && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/')
      }
    })
  )
})
