// Logo vetorizada oficial da WR Mecânica & Cia
// Recriada em SVG a partir da arte original (monograma "WR" serifado dourado + "Mecânica & Cia" laranja).
// Uma única fonte de verdade usada no sistema, no comprovante impresso e na imagem enviada pelo WhatsApp.

export type WrLogoVariant = 'dark' | 'light'

interface BuildOptions {
  idPrefix?: string
  variant?: WrLogoVariant // 'dark' = fundo escuro | 'light' = fundo branco (impressão / WhatsApp)
  showSubtitle?: boolean
  width?: number
  height?: number
}

export function buildWrLogoSvg({
  idPrefix = 'wrlogo',
  variant = 'dark',
  showSubtitle = true,
  width,
  height,
}: BuildOptions = {}): string {
  const p = idPrefix.replace(/[^a-zA-Z0-9_-]/g, '')
  const vbHeight = showSubtitle ? 124 : 92
  const sizeAttrs = `${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''}`

  const gold =
    variant === 'dark'
      ? ['#FFF1C1', '#F7CD5E', '#E5A51B', '#B87A0C']
      : ['#E9B53A', '#D49516', '#B47A0A', '#7E5300']
  const orange =
    variant === 'dark' ? ['#FF8A00', '#FFA63D', '#E86F00'] : ['#F07800', '#FF8C1A', '#D45F00']
  const highlight = variant === 'dark' ? '#FFF7DC' : '#FFE7A3'

  const ray =
    variant === 'dark'
      ? `<path d="M6 54 Q160 44 314 54" stroke="url(#${p}-gold)" stroke-width="1.2" stroke-opacity="0.55" fill="none"/>
         <ellipse cx="250" cy="50" rx="34" ry="1.6" fill="#FFD27A" opacity="0.55"/>`
      : ''

  const subtitle = showSubtitle
    ? `<text x="160" y="116" text-anchor="middle" fill="url(#${p}-orange)"
         font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="30" font-weight="800"
         letter-spacing="0.5">Mecânica &amp; Cia</text>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 ${vbHeight}"${sizeAttrs} role="img" aria-label="WR Mecânica &amp; Cia">
  <defs>
    <linearGradient id="${p}-gold" gradientUnits="userSpaceOnUse" x1="0" y1="12" x2="0" y2="84">
      <stop offset="0" stop-color="${gold[0]}"/>
      <stop offset="0.35" stop-color="${gold[1]}"/>
      <stop offset="0.7" stop-color="${gold[2]}"/>
      <stop offset="1" stop-color="${gold[3]}"/>
    </linearGradient>
    <linearGradient id="${p}-orange" gradientUnits="userSpaceOnUse" x1="40" y1="0" x2="280" y2="0">
      <stop offset="0" stop-color="${orange[0]}"/>
      <stop offset="0.5" stop-color="${orange[1]}"/>
      <stop offset="1" stop-color="${orange[2]}"/>
    </linearGradient>
  </defs>
  ${ray}
  <g fill="url(#${p}-gold)">
    <!-- W (dois "V" serifados sobrepostos: traço grosso + traço fino) -->
    <polygon points="24,14 40,14 70,82 60,82"/>
    <polygon points="64,82 70,82 97,14 92,14"/>
    <polygon points="80,14 96,14 126,82 116,82"/>
    <polygon points="120,82 126,82 153,14 148,14"/>
    <polygon points="18,12 46,12 46,15.5 18,15.5"/>
    <polygon points="74,12 102,12 102,15.5 74,15.5"/>
    <polygon points="141,12 160,12 160,15.5 141,15.5"/>
    <!-- R -->
    <polygon points="166,14 180,14 180,82 166,82"/>
    <polygon points="160,12 184,12 184,15.5 160,15.5"/>
    <polygon points="160,80 186,80 186,83.5 160,83.5"/>
    <path fill-rule="evenodd" d="M180 14 H206 C226 14 237 23 237 33 C237 44 226 52 206 52 H180 Z M180 21 H204 C216 21 222.5 26 222.5 33 C222.5 40.5 216 45 204 45 H180 Z"/>
    <polygon points="196,50 211,50 242,82 227,82"/>
    <polygon points="220,80 250,80 250,83.5 220,83.5"/>
  </g>
  <g stroke="${highlight}" stroke-width="1" opacity="0.75" fill="none">
    <line x1="33" y1="19" x2="63" y2="77"/>
    <line x1="89" y1="19" x2="119" y2="77"/>
    <line x1="173" y1="19" x2="173" y2="78"/>
    <line x1="205" y1="54" x2="232" y2="79"/>
  </g>
  ${subtitle}
</svg>`
}

export function wrLogoDataUrl(options: BuildOptions = {}): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(buildWrLogoSvg(options))}`
}

// Carrega a logo como imagem (para desenhar no canvas da OS enviada no WhatsApp)
export function loadWrLogoImage(options: BuildOptions = {}): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = wrLogoDataUrl(options)
  })
}
