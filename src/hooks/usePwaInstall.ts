import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export const usePwaInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detecta se já está rodando em modo standalone (app instalado)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    setIsInstalled(isStandalone)

    // Detecta iOS (Safari requer adição manual à tela de início)
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIOS(isAppleDevice && !isStandalone)
    const isMobileDevice = /android|iphone|ipad|ipod|mobile/.test(userAgent)

    const handleBeforeInstallPrompt = (e: Event) => {
      // Não suprime o comportamento padrão do navegador
      // Isso permite que o Chrome/Edge exiba o botão nativo de instalação ao lado da estrela na barra de endereços
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      const userAgent = window.navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|iphone|ipad|ipod|mobile/.test(userAgent)

      if (isIOS) {
        alert(
          '📱 Para instalar no iPhone/iPad:\n\n1. Toque no botão de Compartilhar (ícone com seta para cima)\n2. Role para baixo e selecione "Adicionar à Tela de Início"'
        )
      } else if (isMobileDevice) {
        alert(
          '📱 Para instalar no celular:\n\nAbra o menu do navegador (três pontinhos no canto) e toque em "Instalar Aplicativo" ou "Adicionar à tela inicial".'
        )
      } else {
        alert(
          '🖥️ Como Instalar o Aplicativo no PC (Windows / Mac):\n\n' +
          '1. Na barra de endereços do seu navegador (ao lado da estrela de favoritos), clique no ícone de "Instalar aplicativo" (ícone de computador/tela com seta para baixo).\n' +
          '2. Ou clique nos 3 pontinhos no canto superior direito do Chrome/Edge e selecione "Instalar WR Mecânica & Cia...".\n\n' +
          'O aplicativo será instalado como programa independente no seu computador, com atalho na Área de Trabalho e inicialização rápida sem precisar abrir o navegador!'
        )
      }
      return false
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (err) {
      console.error('Erro ao acionar instalação do PWA:', err)
      return false
    }
  }, [deferredPrompt, isIOS])

  return {
    isInstallable,
    isInstalled,
    isIOS,
    installApp,
  }
}
