import React, { useId, useMemo } from 'react'
import { buildWrLogoSvg, WrLogoVariant } from '../utils/wrLogoSvg'
import { useApp } from '../context/AppContext'

interface WrLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showSubtitle?: boolean
  /** Força a variante de cor. Se omitido, segue o tema atual (claro/escuro). */
  variant?: WrLogoVariant
}

const HEIGHTS = {
  sm: 'h-9',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24',
}

export const WrLogo: React.FC<WrLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant,
}) => {
  const { theme } = useApp()
  const rawId = useId()
  const finalVariant: WrLogoVariant = variant || (theme === 'light' ? 'light' : 'dark')

  const svg = useMemo(
    () => buildWrLogoSvg({ idPrefix: `wr${rawId}`, variant: finalVariant, showSubtitle }),
    [rawId, finalVariant, showSubtitle]
  )

  return (
    <span
      className={`inline-flex items-center justify-center select-none [&>svg]:h-full [&>svg]:w-auto ${HEIGHTS[size]} ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
