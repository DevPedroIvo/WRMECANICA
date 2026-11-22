// Service Worker para WR Mecânica & Cia (PWA & Notificações — Cache Seguro sem Tela Preta)
const CACHE_NAME = 'wr-mecanica-v3'

const STATIC_ASSETS = [
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
]

// Instalação: assume imediatamente sem manter versão antiga presa
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Falha ao adicionar ícones ao cache:', err)
      })
    })
  )
  self.skipWaiting()
})

// Ativação: remove TODOS os caches antigos (elimina index.html/JS quebrados de deploys anteriores)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
          return Promise.resolve()
        })
      )
    })
  )
  self.clients.claim()
})

// Estratégia de Fetch: nunca cacheia JS/CSS/HTML de build antigo (evita tela preta pós-deploy na Vercel)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)

  if (!url.protocol.startsWith('http')) return
  // Só intercepta recursos do mesmo domínio
  if (url.origin !== self.location.origin) return

  // Nunca intercepta bundles JS/CSS nem sw.js: sempre deixa ir direto para a rede/CDN da Vercel
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname === '/sw.js'
  ) {
    return
  }

  // Para navegações (HTML), sempre busca da rede (sem cachear HTML velho)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(async () => {
        const cached = await caches.match('/index.html')
        return cached || new Response('Sem conexão com a internet.', { status: 503 })
      })
    )
    return
  }
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
