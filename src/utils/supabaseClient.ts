/**
 * Camada leve de persistência e sincronização otimizada para o Supabase (Cloud & Offline-first):
 * - Suporta credenciais via variáveis de ambiente (.env) OU configuração direta na tela de Configurações
 * - Zero dependências pesadas (usa fetch nativo contra PostgREST)
 * - Projeção explícita de colunas (nunca SELECT *)
 * - Cache local-first com TTL (5 min) evitando egress repetido
 * - Escritas por delta (envia apenas o registro criado/editado, nunca tabelas inteiras)
 * - Debounce na persistência local
 * - Compactação de payload (remove campos vazios e impede blobs/base64 de imagens)
 * - Zero Realtime WebSockets e zero polling automático
 */

export type SyncTable =
  | 'clients'
  | 'vehicles'
  | 'service_orders'
  | 'deferred_payments'
  | 'stock_items'
  | 'financial_records'
  | 'appointments'
  | 'fiscal_settings'

const STORAGE_KEYS = {
  url: 'wr_supabase_url',
  anonKey: 'wr_supabase_anon_key',
}

/**
 * Retorna as credenciais ativas do Supabase (checa localStorage primeiro, depois import.meta.env)
 */
export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.url) : null) || ''
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.anonKey) : null) || ''
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

  const url = (localUrl || envUrl).replace(/\/$/, '')
  const anonKey = localKey || envKey

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  }
}

export function saveSupabaseCredentials(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem(STORAGE_KEYS.url, url.trim().replace(/\/$/, ''))
    } else {
      localStorage.removeItem(STORAGE_KEYS.url)
    }

    if (anonKey.trim()) {
      localStorage.setItem(STORAGE_KEYS.anonKey, anonKey.trim())
    } else {
      localStorage.removeItem(STORAGE_KEYS.anonKey)
    }
  }
}

export function clearSupabaseCredentials(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEYS.url)
    localStorage.removeItem(STORAGE_KEYS.anonKey)
  }
}

export const isSupabaseConfigured = () => getSupabaseCredentials().isConfigured

// Projeção explícita de colunas para economizar banda (egress)
const SELECT_COLUMNS: Record<SyncTable, string> = {
  clients: 'id,payload,updated_at',
  vehicles: 'id,client_id,plate,payload,updated_at',
  service_orders: 'id,client_id,status,payload,updated_at',
  deferred_payments: 'id,client_id,due_date,payload,updated_at',
  stock_items: 'id,code,payload,updated_at',
  financial_records: 'id,type,status,payload,updated_at',
  appointments: 'id,date,status,payload,updated_at',
  fiscal_settings: 'id,payload,updated_at',
}

// Limite de registros por requisição para proteger egress
const DEFAULT_PAGE_LIMIT = 150
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

const cacheTimestamps = new Map<SyncTable, number>()
const inflightRequests = new Map<string, Promise<unknown>>()
const debounceTimers = new Map<string, number>()

let sessionRequestsCount = 0
let sessionBytesTransferred = 0

/**
 * Remove campos vazios e bloqueia acidentalmente strings base64/data:image grandes
 * garantindo que nenhuma imagem pesada vá para o banco do Supabase.
 */
export function compactPayload<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(item => compactPayload(item)) as unknown as T
  }
  if (data && typeof data === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (value === undefined || value === null || value === '') continue
      if (typeof value === 'string' && value.startsWith('data:image/')) {
        // Proteção contra estourar 500MB/5GB do Supabase com imagens base64
        continue
      }
      out[key] = compactPayload(value)
    }
    return out as T
  }
  return data
}

/**
 * Persistência local com debounce (evita serialização JSON síncrona a cada clique)
 */
export function saveLocalDebounced(key: string, value: unknown, delayMs = 300): void {
  const existing = debounceTimers.get(key)
  if (existing) window.clearTimeout(existing)

  const timer = window.setTimeout(() => {
    try {
      const compacted = compactPayload(value)
      localStorage.setItem(key, JSON.stringify(compacted))
    } catch (err) {
      console.warn(`[WR Storage] Falha ao salvar chave ${key}:`, err)
    } finally {
      debounceTimers.delete(key)
    }
  }, delayMs)

  debounceTimers.set(key, timer)
}

export function loadLocalSafe<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function getHeaders(prefer?: string): HeadersInit {
  const { anonKey } = getSupabaseCredentials()
  const headers: Record<string, string> = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  }
  if (prefer) headers['Prefer'] = prefer
  return headers
}

/**
 * Testa a conexão com o Supabase enviando uma requisição leve de verificação
 */
export async function testSupabaseConnection(
  customUrl?: string,
  customKey?: string
): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const url = (customUrl || getSupabaseCredentials().url || '').replace(/\/$/, '')
  const anonKey = customKey || getSupabaseCredentials().anonKey || ''

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'URL e Anon Key do Supabase são obrigatórios.',
    }
  }

  const start = performance.now()
  try {
    const res = await fetch(`${url}/rest/v1/clients?limit=1`, {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
    })

    const latencyMs = Math.round(performance.now() - start)

    if (res.ok) {
      return {
        success: true,
        message: `Conectado com sucesso ao Supabase! Latência: ${latencyMs}ms`,
        latencyMs,
      }
    }

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Chave Anon Key inválida ou sem permissão de acesso ao projeto.',
      }
    }

    if (res.status === 404) {
      return {
        success: false,
        message: 'Tabela "clients" não encontrada. Execute o arquivo supabase/schema.sql no SQL Editor do Supabase.',
      }
    }

    return {
      success: false,
      message: `Erro na resposta do Supabase: HTTP ${res.status}`,
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Não foi possível conectar ao Supabase: ${err.message || 'Verifique sua conexão ou a URL do projeto.'}`,
    }
  }
}

/**
 * Busca otimizada com deduplicação de requests simultâneos e TTL de cache.
 */
export async function fetchTableCached<T>(
  table: SyncTable,
  options?: { force?: boolean; limit?: number }
): Promise<T[] | null> {
  const { url, isConfigured } = getSupabaseCredentials()
  if (!isConfigured) return null

  const lastFetched = cacheTimestamps.get(table) || 0
  if (!options?.force && Date.now() - lastFetched < CACHE_TTL_MS) {
    return null // Cache ainda fresco — 0 requests enviados ao Supabase
  }

  const dedupeKey = `GET:${table}`
  if (inflightRequests.has(dedupeKey)) {
    return inflightRequests.get(dedupeKey) as Promise<T[] | null>
  }

  const limit = options?.limit ?? DEFAULT_PAGE_LIMIT
  const reqUrl = `${url}/rest/v1/${table}?select=${SELECT_COLUMNS[table]}&order=updated_at.desc&limit=${limit}`

  const req = fetch(reqUrl, { headers: getHeaders() })
    .then(async res => {
      sessionRequestsCount += 1
      if (!res.ok) return null
      const text = await res.text()
      sessionBytesTransferred += text.length
      const rows = JSON.parse(text) as Array<{ payload: T }>
      cacheTimestamps.set(table, Date.now())
      return rows.map(r => r.payload)
    })
    .catch(() => null)
    .finally(() => {
      inflightRequests.delete(dedupeKey)
    })

  inflightRequests.set(dedupeKey, req)
  return req
}

let writeQueue: Promise<void> = Promise.resolve()

/**
 * Envia apenas 1 registro (delta upsert) usando Prefer: return=minimal
 * para economizar 100% de egress na resposta da API.
 */
export function upsertDeltaRow(
  table: SyncTable,
  id: string,
  payload: unknown,
  extraColumns?: Record<string, string | number | undefined>
): Promise<void> {
  const { url, isConfigured } = getSupabaseCredentials()
  if (!isConfigured) return Promise.resolve()

  const body = {
    id,
    ...extraColumns,
    payload: compactPayload(payload),
    updated_at: new Date().toISOString(),
  }

  const run = async () => {
    try {
      sessionRequestsCount += 1
      const serialized = JSON.stringify(body)
      sessionBytesTransferred += serialized.length
      const res = await fetch(`${url}/rest/v1/${table}?on_conflict=id`, {
        method: 'POST',
        headers: getHeaders('resolution=merge-duplicates,return=minimal'),
        body: serialized,
      })
      if (!res.ok) {
        console.warn(`[Supabase Delta] HTTP ${res.status} ao sincronizar ${table}/${id}`)
      }
    } catch (err) {
      console.warn(`[Supabase Delta] Falha ao sincronizar ${table}/${id}:`, err)
    }
  }

  writeQueue = writeQueue.then(run, run)
  return writeQueue
}

/**
 * Remove 1 registro específico por ID com return=minimal (zero payload de resposta).
 */
export function deleteDeltaRow(table: SyncTable, id: string): Promise<void> {
  const { url, isConfigured } = getSupabaseCredentials()
  if (!isConfigured) return Promise.resolve()

  const run = async () => {
    try {
      sessionRequestsCount += 1
      const res = await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getHeaders('return=minimal'),
      })
      if (!res.ok) {
        console.warn(`[Supabase Delta] HTTP ${res.status} ao remover ${table}/${id}`)
      }
    } catch (err) {
      console.warn(`[Supabase Delta] Falha ao remover ${table}/${id}:`, err)
    }
  }

  writeQueue = writeQueue.then(run, run)
  return writeQueue
}

export interface StorageMetrics {
  configured: boolean
  localPayloadKB: number
  estimatedFreeTierPercent: number
  sessionRequests: number
  sessionTransferKB: number
  cacheTtlMinutes: number
}

export function getSupabaseOptimizationMetrics(snapshot: unknown): StorageMetrics {
  const bytes = new Blob([JSON.stringify(compactPayload(snapshot))]).size
  const localPayloadKB = Number((bytes / 1024).toFixed(2))
  // Free tier Supabase DB = 500 MB (512.000 KB)
  const estimatedFreeTierPercent = Number(((localPayloadKB / 512000) * 100).toFixed(4))

  return {
    configured: isSupabaseConfigured(),
    localPayloadKB,
    estimatedFreeTierPercent,
    sessionRequests: sessionRequestsCount,
    sessionTransferKB: Number((sessionBytesTransferred / 1024).toFixed(2)),
    cacheTtlMinutes: Math.round(CACHE_TTL_MS / 60000),
  }
}
