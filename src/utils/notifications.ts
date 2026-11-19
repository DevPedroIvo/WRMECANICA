/**
 * Utilitário de Notificações do Sistema e do Dispositivo (Web Notifications API)
 * Permite que a oficina receba alertas fora do navegador (celular, tablet e computador)
 */

// Gera um som agradável de notificação usando Web Audio API
export const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    
    // Primeiro beep (880Hz - A5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, ctx.currentTime)
    gain1.gain.setValueAtTime(0.15, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(ctx.currentTime + 0.15)

    // Segundo beep mais agudo (1320Hz - E6)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.12)
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.12)
    osc2.stop(ctx.currentTime + 0.35)
  } catch (e) {
    // Web audio pode estar restrito até interação do usuário
  }
}

export type NotificationStatus = 'granted' | 'denied' | 'default' | 'unsupported'

export const getNotificationPermissionStatus = (): NotificationStatus => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported'
  }
  return Notification.permission
}

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      sendAppNotification('🔔 Notificações Ativadas!', {
        body: 'Você agora receberá alertas da WR Mecânica no seu aparelho mesmo fora da tela.',
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Erro ao pedir permissão de notificação:', error)
    return false
  }
}

export interface AppNotificationOptions {
  body?: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
}

export const sendAppNotification = (title: string, options: AppNotificationOptions = {}) => {
  // Sempre toca o chime sonoro
  playNotificationChime()

  // Vibra no smartphone
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 80, 150])
    } catch {
      // Ignora erro de vibração
    }
  }

  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  if (Notification.permission !== 'granted') {
    return
  }

  const notificationOptions: NotificationOptions = {
    body: options.body || 'Atualização na WR Mecânica & Cia',
    icon: options.icon || '/assets/wr-logo.jpg',
    badge: options.badge || '/assets/wr-logo.jpg',
    tag: options.tag || 'wr-notification',
    data: options.data,
  }

  // Tenta enviar via ServiceWorker para garantir que apareça fora do app
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready
      .then(registration => {
        return registration.showNotification(title, notificationOptions)
      })
      .catch(() => {
        // Fallback para new Notification direto
        try {
          new Notification(title, notificationOptions)
        } catch (e) {
          console.warn('Erro ao disparar notificação local:', e)
        }
      })
  } else {
    try {
      new Notification(title, notificationOptions)
    } catch (e) {
      console.warn('Erro ao disparar notificação nativa:', e)
    }
  }
}
