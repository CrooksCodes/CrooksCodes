-- Admin dashboard schema: a single-owner ledger behind /admin.
--
-- Access model
--   * Exactly one user can read or write any of these tables: the user whose id
--     is in private.admin_owner, signed in with two-factor (JWT aal = aal2).
--   * The owner row is inserted out of band (SQL editor or service role), never
--     in a migration, so no account id is committed to the repository.
--   * anon has no privileges on anything here. Other authenticated accounts get
--     zero rows, because every policy goes through private.is_owner().
--   * audit_log is written only by the SECURITY DEFINER trigger below.
--
-- All money is numeric(12,2). Every table has id, created_at, updated_at.

-- ── Private schema (not exposed through the Data API) ──────────────────────
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- Single-row table: the primary key is a constant true, so a second owner
-- cannot be inserted.
create table private.admin_owner (
  singleton  boolean primary key default true check (singleton),
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
revoke all on private.admin_owner from public, anon, authenticated;

-- True only for the owner, and only on a two-factor (aal2) session.
create or replace function private.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'aal') = 'aal2', false)
     and exists (
           select 1 from private.admin_owner o
           where o.user_id = (select auth.uid())
         );
$$;
revoke all on function private.is_owner() from public, anon;
grant execute on function private.is_owner() to authenticated;

-- ── Enums ──────────────────────────────────────────────────────────────────
create type public.product        as enum ('Website', 'GBP');
create type public.billing_type   as enum ('one_time', 'monthly');
create type public.client_status  as enum ('active', 'past_completed');
-- Website: signed → in_build → live → warranty → handover → completed
-- GBP:     active / mtm / cancelled
create type public.deal_status    as enum (
  'signed', 'in_build', 'live', 'warranty', 'handover', 'completed',
  'active', 'mtm', 'cancelled'
);
create type public.payment_method as enum ('etransfer', 'other');
create type public.payment_status as enum ('pending', 'received');
create type public.payment_kind   as enum ('deposit', 'final', 'monthly', 'other');
create type public.invoice_status as enum ('draft', 'open', 'paid', 'void');
create type public.pipeline_stage as enum ('lead', 'discovery', 'quote', 'signed', 'not_signed');
create type public.audit_action   as enum ('INSERT', 'UPDATE', 'DELETE');

-- ── updated_at helper ──────────────────────────────────────────────────────
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── Tables ─────────────────────────────────────────────────────────────────
-- Display name for audit history. id = auth.users.id.
create table public.users_profile (
  id         uuid primary key references auth.users (id),
  name       text not null,
  email      text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  contact_name  text,
  contact_email text,
  contact_phone text,
  address       text,
  status        public.client_status not null default 'active',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.deals (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references public.clients (id) on delete cascade,
  product           public.product not null,
  value             numeric(12,2) not null check (value >= 0),
  billing_type      public.billing_type not null,
  status            public.deal_status not null,
  signed_date       date,
  go_live_date      date,
  term_end_date     date,           -- GBP term end, or website warranty/handover
  next_checkin_date date,
  billing_day       int check (billing_day between 1 and 31),
  min_term_months   int not null default 6 check (min_term_months > 0),
  delivery_flag     boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index deals_client_id_idx on public.deals (client_id);

create table public.invoices (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.deals (id) on delete cascade,
  client_id   uuid not null references public.clients (id) on delete cascade,
  number      text,
  amount      numeric(12,2) not null check (amount > 0),
  status      public.invoice_status not null default 'draft',
  issued_date date,
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index invoices_deal_id_idx on public.invoices (deal_id);
create index invoices_client_id_idx on public.invoices (client_id);

create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references public.deals (id) on delete cascade,
  client_id     uuid not null references public.clients (id) on delete cascade,
  amount        numeric(12,2) not null check (amount > 0),
  method        public.payment_method not null default 'etransfer',
  status        public.payment_status not null default 'pending',
  kind          public.payment_kind not null,
  due_date      date,
  received_date date,
  received_into text,
  period_month  text check (period_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  invoice_id    uuid references public.invoices (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index payments_deal_period_idx on public.payments (deal_id, period_month);
create index payments_client_id_idx on public.payments (client_id);
create index payments_invoice_id_idx on public.payments (invoice_id);

create table public.pipeline_leads (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  contact_name        text,
  contact_email       text,
  contact_phone       text,
  product             public.product,
  stage               public.pipeline_stage not null default 'lead',
  estimated_value     numeric(12,2) check (estimated_value >= 0),
  estimated_value_max numeric(12,2) check (estimated_value_max >= 0),
  quote_amount        numeric(12,2) check (quote_amount >= 0),
  last_activity_date  date,
  not_signed_reason   text,
  nurture             boolean not null default false,
  converted_client_id uuid references public.clients (id) on delete set null,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (estimated_value_max is null or estimated_value is null
         or estimated_value_max >= estimated_value)
);
create index pipeline_leads_converted_idx on public.pipeline_leads (converted_client_id);

-- Owner draws from received money.
create table public.draws (
  id         uuid primary key default gen_random_uuid(),
  amount     numeric(12,2) not null check (amount > 0),
  date       date not null default current_date,
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id  uuid not null,
  field      text,
  old_value  text,
  new_value  text,
  changed_by uuid references public.users_profile (id),
  action     public.audit_action not null,
  changed_at timestamptz not null default now()
);
create index audit_log_record_idx on public.audit_log (table_name, record_id);
create index audit_log_changed_at_idx on public.audit_log (changed_at desc);
create index audit_log_changed_by_idx on public.audit_log (changed_by);

-- Not used by the UI yet; kept so the table and its rows carry over.
create table public.delivery_tasks (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid references public.clients (id) on delete cascade,
  deal_id    uuid references public.deals (id) on delete cascade,
  label      text,
  done       boolean not null default false,
  done_at    timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index delivery_tasks_client_id_idx on public.delivery_tasks (client_id);
create index delivery_tasks_deal_id_idx on public.delivery_tasks (deal_id);

-- ── updated_at triggers ────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'users_profile','clients','deals','invoices','payments',
    'pipeline_leads','draws','delivery_tasks'
  ] loop
    execute format(
      'create trigger t_%1$s_updated before update on public.%1$I
         for each row execute function private.set_updated_at();', t);
  end loop;
end $$;

-- ── Audit trail for money tables ───────────────────────────────────────────
-- UPDATE writes one row per changed field; INSERT and DELETE write one
-- summary row. changed_by is null for service-role writes.
create or replace function private.audit_money_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  old_j jsonb;
  new_j jsonb;
  k     text;
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log (table_name, record_id, field, old_value, new_value, changed_by, action)
    values (tg_table_name, new.id, null, null, to_jsonb(new)::text, actor, 'INSERT');
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.audit_log (table_name, record_id, field, old_value, new_value, changed_by, action)
    values (tg_table_name, old.id, null, to_jsonb(old)::text, null, actor, 'DELETE');
    return old;
  else
    old_j := to_jsonb(old);
    new_j := to_jsonb(new);
    for k in select jsonb_object_keys(new_j) loop
      continue when k = 'updated_at';
      if (old_j -> k) is distinct from (new_j -> k) then
        insert into public.audit_log (table_name, record_id, field, old_value, new_value, changed_by, action)
        values (tg_table_name, new.id, k, old_j ->> k, new_j ->> k, actor, 'UPDATE');
      end if;
    end loop;
    return new;
  end if;
end;
$$;
revoke all on function private.audit_money_change() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['deals','payments','invoices','draws'] loop
    execute format(
      'create trigger t_%1$s_audit after insert or update or delete on public.%1$I
         for each row execute function private.audit_money_change();', t);
  end loop;
end $$;

-- ── Privileges ─────────────────────────────────────────────────────────────
-- Supabase's default privileges grant everything to anon and authenticated on
-- new public tables. Take it all back, then grant only what the owner needs.
do $$
declare t text;
begin
  foreach t in array array[
    'users_profile','clients','deals','invoices','payments',
    'pipeline_leads','draws','audit_log','delivery_tasks'
  ] loop
    execute format('revoke all on public.%I from anon, authenticated;', t);
    execute format('alter table public.%I enable row level security;', t);
  end loop;

  foreach t in array array[
    'clients','deals','invoices','payments','pipeline_leads','draws','delivery_tasks'
  ] loop
    execute format('grant select, insert, update, delete on public.%I to authenticated;', t);
    execute format(
      'create policy %1$s_owner_all on public.%1$I for all to authenticated
         using ((select private.is_owner())) with check ((select private.is_owner()));', t);
  end loop;
end $$;

-- Read-only for the owner. Profiles are managed out of band; audit rows are
-- written only by the trigger above.
grant select on public.users_profile to authenticated;
create policy users_profile_owner_select on public.users_profile
  for select to authenticated using ((select private.is_owner()));

grant select on public.audit_log to authenticated;
create policy audit_log_owner_select on public.audit_log
  for select to authenticated using ((select private.is_owner()));
