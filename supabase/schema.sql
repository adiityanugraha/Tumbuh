-- Skema akun Tumbuh. Jalankan sekali di Supabase: Dashboard > SQL Editor > New query > Run.
-- Syarat: Authentication > Sign In / Providers > Email: matikan "Confirm email".
-- (Username dipetakan ke email internal <username>@tumbuh.app, jadi tidak ada email sungguhan yang bisa dikonfirmasi.)
--
-- Peran: anak (punya data belajar + kode keluarga) dan ortu (terhubung ke satu atau beberapa anak lewat kode keluarga).

-- Hapus skema kode keluarga anonim versi sebelumnya (hanya berisi data uji).
drop function if exists public.create_family(jsonb);
drop function if exists public.join_family(text);
drop table if exists public.families cascade;
drop table if exists public.family_members cascade;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('anak', 'ortu')),
  username text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.children (
  id uuid primary key references public.profiles (id) on delete cascade,
  family_code text not null unique,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.parent_links (
  parent_id uuid not null references public.profiles (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, child_id)
);

alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.parent_links enable row level security;

create or replace function public.is_linked_parent(child uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from parent_links where parent_id = auth.uid() and child_id = child);
$$;

drop policy if exists "profil sendiri" on public.profiles;
create policy "profil sendiri" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "anak sendiri atau orang tuanya membaca" on public.children;
create policy "anak sendiri atau orang tuanya membaca" on public.children
  for select to authenticated using (id = auth.uid() or public.is_linked_parent(id));

drop policy if exists "anak sendiri atau orang tuanya mengubah" on public.children;
create policy "anak sendiri atau orang tuanya mengubah" on public.children
  for update to authenticated
  using (id = auth.uid() or public.is_linked_parent(id))
  with check (id = auth.uid() or public.is_linked_parent(id));

drop policy if exists "tautan sendiri" on public.parent_links;
create policy "tautan sendiri" on public.parent_links
  for select to authenticated using (parent_id = auth.uid());

drop policy if exists "lepas tautan sendiri" on public.parent_links;
create policy "lepas tautan sendiri" on public.parent_links
  for delete to authenticated using (parent_id = auth.uid());

-- Hanya orang tua yang boleh mengganti kelas: perubahan kelas dari akun anak dikembalikan ke nilai lama.
create or replace function public.lock_child_grade()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.id
     and old.data -> 'student' -> 'grade' is not null
     and (new.data -> 'student' -> 'grade') is distinct from (old.data -> 'student' -> 'grade') then
    new.data := jsonb_set(new.data, '{student,grade}', old.data -> 'student' -> 'grade');
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists lock_child_grade on public.children;
create trigger lock_child_grade before update on public.children
  for each row execute function public.lock_child_grade();

-- Daftarkan akun anak yang baru dibuat: profil + data awal + kode keluarga 6 karakter.
-- Batas: 16 juta kombinasi kode (heksadesimal); tambah panjang kode bila dipakai luas.
create or replace function public.register_child(p_username text, initial jsonb)
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
  insert into profiles (id, role, username) values (auth.uid(), 'anak', lower(p_username));
  loop
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from children where family_code = new_code);
  end loop;
  insert into children (id, family_code, data) values (auth.uid(), new_code, initial);
  return new_code;
end;
$$;

-- Hubungkan akun orang tua dengan anak lewat kode keluarga. Bisa dipanggil berkali-kali untuk beberapa anak.
create or replace function public.link_child(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  child uuid;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'ortu') then
    raise exception 'bukan akun orang tua';
  end if;
  select id into child from children where family_code = upper(trim(p_code));
  if child is null then
    raise exception 'kode tidak ditemukan';
  end if;
  insert into parent_links (parent_id, child_id) values (auth.uid(), child) on conflict do nothing;
  return child;
end;
$$;

-- Daftarkan akun orang tua yang baru dibuat, lalu hubungkan dengan anak pertama.
create or replace function public.register_parent(p_username text, p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'perlu login';
  end if;
  if not exists (select 1 from children where family_code = upper(trim(p_code))) then
    raise exception 'kode tidak ditemukan';
  end if;
  insert into profiles (id, role, username) values (auth.uid(), 'ortu', lower(p_username)) on conflict (id) do nothing;
  return public.link_child(p_code);
end;
$$;

revoke all on function public.register_child(text, jsonb) from public, anon;
revoke all on function public.register_parent(text, text) from public, anon;
revoke all on function public.link_child(text) from public, anon;
revoke all on function public.is_linked_parent(uuid) from public, anon;
grant execute on function public.register_child(text, jsonb) to authenticated;
grant execute on function public.register_parent(text, text) to authenticated;
grant execute on function public.link_child(text) to authenticated;
grant execute on function public.is_linked_parent(uuid) to authenticated;
