-- Skema sinkronisasi Tumbuh. Jalankan sekali di Supabase: Dashboard > SQL Editor > New query > Run.
-- Syarat: Authentication > Sign In / Providers > "Allow anonymous sign-ins" diaktifkan.
--
-- Satu keluarga = satu anak. Data keluarga disimpan utuh sebagai JSON (sama dengan isi localStorage).
-- Perangkat yang tahu kode keluarga menjadi anggota, dan hanya anggota yang bisa membaca/mengubah datanya (RLS).

create table if not exists public.families (
  code text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_code text not null references public.families (code) on delete cascade,
  user_id uuid not null default auth.uid(),
  joined_at timestamptz not null default now(),
  primary key (family_code, user_id)
);

alter table public.families enable row level security;
alter table public.family_members enable row level security;

drop policy if exists "anggota membaca keluarga" on public.families;
create policy "anggota membaca keluarga" on public.families
  for select to authenticated
  using (exists (select 1 from public.family_members m where m.family_code = families.code and m.user_id = auth.uid()));

drop policy if exists "anggota mengubah keluarga" on public.families;
create policy "anggota mengubah keluarga" on public.families
  for update to authenticated
  using (exists (select 1 from public.family_members m where m.family_code = families.code and m.user_id = auth.uid()))
  with check (exists (select 1 from public.family_members m where m.family_code = families.code and m.user_id = auth.uid()));

drop policy if exists "melihat keanggotaan sendiri" on public.family_members;
create policy "melihat keanggotaan sendiri" on public.family_members
  for select to authenticated
  using (user_id = auth.uid());

-- Buat keluarga baru dari data perangkat ini, kembalikan kode 6 karakter.
-- Batas: 16 juta kombinasi kode (heksadesimal). Cukup untuk lomba; tambah panjang kode atau rate limit bila dipakai luas.
create or replace function public.create_family(initial jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
begin
  if auth.uid() is null then
    raise exception 'perlu login';
  end if;
  loop
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from families where code = new_code);
  end loop;
  insert into families (code, data) values (new_code, initial);
  insert into family_members (family_code, user_id) values (new_code, auth.uid());
  return new_code;
end;
$$;

-- Bergabung dengan kode keluarga, kembalikan data keluarga.
create or replace function public.join_family(family_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  found jsonb;
begin
  if auth.uid() is null then
    raise exception 'perlu login';
  end if;
  select data into found from families where code = upper(join_family.family_code);
  if found is null then
    raise exception 'kode tidak ditemukan';
  end if;
  insert into family_members (family_code, user_id)
  values (upper(join_family.family_code), auth.uid())
  on conflict do nothing;
  return found;
end;
$$;

revoke all on function public.create_family(jsonb) from public, anon;
revoke all on function public.join_family(text) from public, anon;
grant execute on function public.create_family(jsonb) to authenticated;
grant execute on function public.join_family(text) to authenticated;
