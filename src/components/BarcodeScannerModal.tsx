import React, { useEffect, useRef, useState } from 'react'
import { Camera, X, Scan, AlertCircle, RefreshCw } from 'lucide-react'

interface BarcodeScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onDetected: (barcode: string) => void
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [manualCode, setManualCode] = useState('')

  useEffect(() => {
    if (!isOpen) {
      stopCamera()
      return
    }

    startCamera()

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    setErrorMessage('')
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false)
        setErrorMessage('Seu navegador não possui suporte a câmera.')
        return
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      setStream(mediaStream)
      setHasPermission(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play().catch(e => console.warn('Erro ao iniciar vídeo:', e))
      }

      // Inicia detecção contínua se o navegador suportar BarcodeDetector
      // @ts-ignore
      if ('BarcodeDetector' in window) {
        // @ts-ignore
        const detector = new window.BarcodeDetector({
          formats: ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e'],
        })

        const interval = window.setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const barcodes = await detector.detect(videoRef.current)
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                const scanned = barcodes[0].rawValue.trim()
                window.clearInterval(interval)
                triggerSuccess(scanned)
              }
            } catch {
              // Frame ignorado
            }
          }
        }, 300)

        return () => window.clearInterval(interval)
      }
    } catch (err: any) {
      console.warn('Erro ao acessar câmera:', err)
      setHasPermission(false)
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Permissão de acesso à câmera negada. Habilite nas permissões do navegador.'
          : 'Não foi possível acessar a câmera do dispositivo.'
      )
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const triggerSuccess = (code: string) => {
    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
    stopCamera()
    onDetected(code)
    onClose()
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      triggerSuccess(manualCode.trim())
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn select-none">
      <div className="wr-modal-panel max-w-md w-full space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-wr-border">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-wr-orange" />
            <h3 className="text-sm font-bold text-wr-text">
              Leitor de Código de Barras
            </h3>
          </div>
          <button
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="text-wr-muted hover:text-wr-text p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder da Câmera */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-wr-border">
          {hasPermission !== false ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Mira visual */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-28 border-2 border-wr-orange rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500 animate-pulse" />
                  <span className="absolute -bottom-6 inset-x-0 text-center text-[10px] text-white font-bold drop-shadow">
                    Aponte para o código da peça
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-orange-500 mx-auto" />
              <p className="text-xs text-wr-muted">{errorMessage}</p>
              <button
                type="button"
                onClick={startCamera}
                className="wr-btn-secondary px-3 py-1.5 text-xs mx-auto"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Tentar Novamente
              </button>
            </div>
          )}
        </div>

        {/* Digitação Manual Alternativa */}
        <form onSubmit={handleManualSubmit} className="space-y-2 text-xs">
          <label className="block text-[11px] text-wr-muted font-semibold">
            Ou digite/leia com leitor USB / Bluetooth:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="Ex: 7891234567890 ou COD-001"
              className="wr-input flex-1 font-mono text-xs"
            />
            <button type="submit" className="wr-btn-primary px-3 text-xs">
              <Scan className="h-4 w-4" /> Buscar
            </button>
          </div>
        </form>

        <div className="flex justify-end pt-2 border-t border-wr-border">
          <button
            type="button"
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="wr-btn-secondary text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
