-- ============================================================
--  Терракино: аккаунты пользователей
--  Вставьте ВЕСЬ этот текст в Supabase -> SQL Editor -> Run.
--  Скрипт можно запускать повторно: ничего не сломается.
-- ============================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------- таблицы ----------
create table if not exists public.app_settings (
  k text primary key,
  v text not null
);
insert into public.app_settings (k, v) values ('max_per_device', '1')
on conflict (k) do nothing;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  username text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  username_lc text generated always as (lower(username)) stored,
  pass_hash text not null,
  role text not null default 'user' check (role in ('user', 'owner')),
  device text,
  created_at timestamptz not null default now(),
  last_seen timestamptz
);
-- титул, который выдаёт создатель (пусто = нет титула)
alter table public.accounts add column if not exists title text;
alter table public.accounts drop constraint if exists accounts_title_len;
alter table public.accounts add constraint accounts_title_len check (title is null or char_length(title) between 1 and 24);

create unique index if not exists accounts_username_lc_key on public.accounts (username_lc);
create index if not exists accounts_device_idx on public.accounts (device);

create table if not exists public.sessions (
  token_hash text primary key,
  account_id uuid not null references public.accounts (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists sessions_account_idx on public.sessions (account_id);

create table if not exists public.login_attempts (
  id bigserial primary key,
  username_lc text not null,
  ts timestamptz not null default now()
);
create index if not exists login_attempts_idx on public.login_attempts (username_lc, ts);

-- ---------- закрываем таблицы от прямого доступа из приложения ----------
alter table public.app_settings enable row level security;
alter table public.accounts enable row level security;
alter table public.sessions enable row level security;
alter table public.login_attempts enable row level security;
revoke all on public.app_settings, public.accounts, public.sessions, public.login_attempts from anon, authenticated;
revoke all on sequence public.login_attempts_id_seq from anon, authenticated;

-- ---------- имя пользователя изменить нельзя никому ----------
create or replace function public.accounts_guard()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id or new.username is distinct from old.username then
    raise exception 'username and id cannot be changed';
  end if;
  return new;
end;
$$;
drop trigger if exists accounts_guard on public.accounts;
create trigger accounts_guard before update on public.accounts
  for each row execute function public.accounts_guard();

-- ---------- регистрация ----------
create or replace function public.register(p_user text, p_pass text, p_device text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
  v_tok text;
  v_max int;
begin
  p_user := btrim(coalesce(p_user, ''));
  if p_user !~ '^[A-Za-z0-9_]{3,20}$' then
    return jsonb_build_object('error', 'bad_username');
  end if;
  if length(coalesce(p_pass, '')) < 6 or length(p_pass) > 72 then
    return jsonb_build_object('error', 'bad_password');
  end if;
  if coalesce(length(p_device), 0) < 8 or length(p_device) > 100 then
    return jsonb_build_object('error', 'bad_device');
  end if;
  if exists (select 1 from accounts where username_lc = lower(p_user)) then
    return jsonb_build_object('error', 'taken');
  end if;
  select coalesce((select v::int from app_settings where k = 'max_per_device'), 1) into v_max;
  -- с одного телефона можно создать только v_max аккаунтов (телефон создателя не ограничен)
  if not exists (select 1 from accounts where device = p_device and role = 'owner')
     and (select count(*) from accounts where device = p_device) >= v_max then
    return jsonb_build_object('error', 'device_limit');
  end if;
  insert into accounts (username, pass_hash, device)
  values (p_user, crypt(p_pass, gen_salt('bf', 10)), p_device)
  returning id into v_id;
  v_tok := encode(gen_random_bytes(32), 'hex');
  insert into sessions (token_hash, account_id)
  values (encode(digest(v_tok, 'sha256'), 'hex'), v_id);
  return jsonb_build_object('token', v_tok, 'username', p_user, 'role', 'user');
exception when unique_violation then
  return jsonb_build_object('error', 'taken');
end;
$$;

-- ---------- вход (5 неверных попыток = пауза на 10 минут) ----------
create or replace function public.login(p_user text, p_pass text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  a accounts%rowtype;
  u text := lower(btrim(coalesce(p_user, '')));
  v_tok text;
begin
  delete from login_attempts where ts < now() - interval '1 day';
  if (select count(*) from login_attempts where username_lc = u and ts > now() - interval '10 minutes') >= 5 then
    return jsonb_build_object('error', 'too_many');
  end if;
  select * into a from accounts where username_lc = u;
  if not found or a.pass_hash <> crypt(coalesce(p_pass, ''), a.pass_hash) then
    insert into login_attempts (username_lc) values (left(u, 40));
    return jsonb_build_object('error', 'invalid');
  end if;
  delete from login_attempts where username_lc = u;
  v_tok := encode(gen_random_bytes(32), 'hex');
  insert into sessions (token_hash, account_id)
  values (encode(digest(v_tok, 'sha256'), 'hex'), a.id);
  update accounts set last_seen = now() where id = a.id;
  return jsonb_build_object('token', v_tok, 'username', a.username, 'role', a.role, 'title', a.title);
end;
$$;

-- ---------- проверка сессии ----------
create or replace function public.me(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  a accounts%rowtype;
begin
  select ac.* into a
  from sessions s join accounts ac on ac.id = s.account_id
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex')
    and s.created_at > now() - interval '180 days';
  if not found then
    return jsonb_build_object('error', 'invalid');
  end if;
  update accounts set last_seen = now()
  where id = a.id and (last_seen is null or last_seen < now() - interval '1 hour');
  return jsonb_build_object('username', a.username, 'role', a.role, 'title', a.title);
end;
$$;

-- ---------- выход ----------
create or replace function public.logout(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  delete from sessions where token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
  return true;
end;
$$;

-- ---------- статистика (только для создателя) ----------
create or replace function public.admin_stats(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  a accounts%rowtype;
begin
  select ac.* into a
  from sessions s join accounts ac on ac.id = s.account_id
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
  if not found or a.role <> 'owner' then
    return jsonb_build_object('error', 'forbidden');
  end if;
  return jsonb_build_object(
    'users', (select count(*) from accounts),
    'new7', (select count(*) from accounts where created_at > now() - interval '7 days'),
    'active24', (select count(*) from accounts where last_seen > now() - interval '24 hours'),
    'recent', coalesce((
      select jsonb_agg(jsonb_build_object('u', r.username, 'c', r.created_at, 't', r.title) order by r.created_at desc)
      from (select username, created_at, title from accounts order by created_at desc limit 15) r
    ), '[]'::jsonb)
  );
end;
$$;

-- ---------- выдать или снять титул (только создатель) ----------
create or replace function public.admin_set_title(p_token text, p_user text, p_title text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  a accounts%rowtype;
  v_title text;
  n int;
begin
  select ac.* into a
  from sessions s join accounts ac on ac.id = s.account_id
  where s.token_hash = encode(digest(coalesce(p_token, ''), 'sha256'), 'hex');
  if not found or a.role <> 'owner' then
    return jsonb_build_object('error', 'forbidden');
  end if;
  v_title := nullif(btrim(coalesce(p_title, '')), '');
  if v_title is not null and (char_length(v_title) > 24 or v_title ~ '[[:cntrl:]]') then
    return jsonb_build_object('error', 'bad_title');
  end if;
  update accounts set title = v_title where username_lc = lower(btrim(coalesce(p_user, '')));
  get diagnostics n = row_count;
  if n = 0 then
    return jsonb_build_object('error', 'no_user');
  end if;
  return jsonb_build_object(
    'ok', true,
    'username', (select username from accounts where username_lc = lower(btrim(p_user))),
    'title', v_title
  );
end;
$$;

-- ---------- пинг (чтобы бесплатная база не засыпала) ----------
create or replace function public.ping()
returns text
language sql
as $$ select 'ok'::text $$;

-- ---------- права на вызов ----------
revoke all on function public.register(text, text, text) from public;
revoke all on function public.login(text, text) from public;
revoke all on function public.me(text) from public;
revoke all on function public.logout(text) from public;
revoke all on function public.admin_stats(text) from public;
revoke all on function public.admin_set_title(text, text, text) from public;
revoke all on function public.ping() from public;
grant execute on function public.register(text, text, text) to anon, authenticated;
grant execute on function public.login(text, text) to anon, authenticated;
grant execute on function public.me(text) to anon, authenticated;
grant execute on function public.logout(text) to anon, authenticated;
grant execute on function public.admin_stats(text) to anon, authenticated;
grant execute on function public.admin_set_title(text, text, text) to anon, authenticated;
grant execute on function public.ping() to anon, authenticated;

-- ============================================================
--  ПОЛЕЗНЫЕ КОМАНДЫ (запускайте по одной, подставив своё)
-- ============================================================
-- Сделать себя создателем (после регистрации в приложении):
--   update public.accounts set role = 'owner' where username_lc = lower('ВАШЕ_ИМЯ');
-- Выдать титул вручную (то же делается в приложении: Профиль -> Выдать титул):
--   update public.accounts set title = 'Легенда' where username_lc = lower('ИМЯ');
-- Снять титул:
--   update public.accounts set title = null where username_lc = lower('ИМЯ');
-- Сколько пользователей:
--   select count(*) from public.accounts;
-- Список пользователей:
--   select username, role, created_at, last_seen from public.accounts order by created_at desc;
-- Удалить пользователя (он выйдет из аккаунта, имя освободится):
--   delete from public.accounts where username_lc = lower('ИМЯ');
-- Сбросить забытый пароль:
--   update public.accounts set pass_hash = crypt('НОВЫЙ_ПАРОЛЬ', gen_salt('bf', 10)) where username_lc = lower('ИМЯ');
-- Разрешить 2 аккаунта с одного телефона:
--   update public.app_settings set v = '2' where k = 'max_per_device';
