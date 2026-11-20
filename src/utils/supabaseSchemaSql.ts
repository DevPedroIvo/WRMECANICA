export const SUPABASE_SCHEMA_SQL = `-- ============================================================================
-- WR Mecânica & Cia — Schema PostgreSQL Otimizado para Supabase Free Tier
-- ============================================================================
-- Boas práticas aplicadas para nunca ultrapassar os limites gratuitos (500MB DB / 5GB egress):
-- 1. Zero imagens/blobs/base64 no banco (apenas texto e JSONB compacto)
-- 2. Índices apenas nas colunas realmente filtradas (client_id, plate, status, due_date)
-- 3. Chaves estrangeiras com ON DELETE CASCADE nos veículos vinculados aos clientes
-- 4. Upsert por delta via PostgREST com Prefer: return=minimal
-- ============================================================================

create table if not exists public.clients (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id text primary key,
  client_id text not null references public.clients(id) on delete cascade,
  plate text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists idx_vehicles_client_id on public.vehicles(client_id);
create index if not exists idx_vehicles_plate on public.vehicles(plate);

create table if not exists public.service_orders (
  id text primary key,
  client_id text not null,
  status text not null default 'aguardando',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_client_id on public.service_orders(client_id);
create index if not exists idx_orders_status on public.service_orders(status);

create table if not exists public.deferred_payments (
  id text primary key,
  client_id text not null,
  due_date date not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists idx_deferred_client_id on public.deferred_payments(client_id);
create index if not exists idx_deferred_due_date on public.deferred_payments(due_date);

create table if not exists public.stock_items (
  id text primary key,
  code text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists idx_stock_code on public.stock_items(code);

create table if not exists public.financial_records (
  id text primary key,
  type text not null,
  status text not null default 'pendente',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists idx_financial_status on public.financial_records(status);

create table if not exists public.appointments (
  id text primary key,
  date text not null,
  status text not null default 'aguardando',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.fiscal_settings (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

-- Habilitar RLS em todas as tabelas
alter table public.clients enable row level security;
alter table public.vehicles enable row level security;
alter table public.service_orders enable row level security;
alter table public.deferred_payments enable row level security;
alter table public.stock_items enable row level security;
alter table public.financial_records enable row level security;
alter table public.appointments enable row level security;
alter table public.fiscal_settings enable row level security;

-- Políticas de acesso para o app da oficina (anon/authenticated)
drop policy if exists "wr_clients_all" on public.clients;
create policy "wr_clients_all" on public.clients for all to anon, authenticated using (true) with check (true);

drop policy if exists "wr_vehicles_all" on public.vehicles;
create policy "wr_vehicles_all" on public.vehicles for all to anon, authenticated using (true) with check (true);

drop policy if exists "wr_service_orders_all" on public.service_orders;
create policy "wr_service_orders_all" on public.service_orders for all to anon, authenticated using (true) with check (true);

drop policy if exists "wr_deferred_payments_all" on public.deferred_payments;
create policy "wr_deferred_payments_all" on public.deferred_payments for all to anon, authenticated using (true) with check (true);

drop policy if exists "wr_stock_items_all" on public.stock_items;
create policy "wr_stock_items_all" on public.stock_items for all to anon, authenticated using (true) with check (true);

drop policy if exists "wr_financial_records_all" on public.financial_records;
create policy "wr_financial_records_all" on public.financial_records for all to anon, authenticated using (true) with check (true);

drop policy if exists "wr_appointments_all" on public.appointments;
create policy "wr_appointments_all" on public.appointments for all to anon, authenticated using (true) with check (true);

drop policy if exists "wr_fiscal_settings_all" on public.fiscal_settings;
create policy "wr_fiscal_settings_all" on public.fiscal_settings for all to anon, authenticated using (true) with check (true);

-- Permissões de tabela
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  public.clients,
  public.vehicles,
  public.service_orders,
  public.deferred_payments,
  public.stock_items,
  public.financial_records,
  public.appointments,
  public.fiscal_settings
to anon, authenticated;
`
