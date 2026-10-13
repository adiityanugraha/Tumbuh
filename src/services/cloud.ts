import type { SupabaseClient } from "@supabase/supabase-js";
import { usernameToEmail } from "@/lib/account";
import type { Account, ChildSummary, SyncState } from "@/lib/types";

/**
 * Akun dan sinkronisasi lewat Supabase (lihat supabase/schema.sql).
 * Aktif hanya bila NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY diisi saat build.
 * Anon key memang publik: keamanan data dijaga Row Level Security di database.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isCloudConfigured = Boolean(SUPABASE_URL && KEY);

const ACCOUNT_KEY = "tumbuh:akun";

/** Akun yang sedang masuk di perangkat ini. Hanya dipanggil di client. */
export const accountStore = {
  get: (): Account | null => {
    try {
      const raw = localStorage.getItem(ACCOUNT_KEY);
      return raw ? (JSON.parse(raw) as Account) : null;
    } catch {
      return null;
    }
  },
  set: (account: Account) =>
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account)),
  clear: () => localStorage.removeItem(ACCOUNT_KEY),
};

let client: Promise<SupabaseClient> | null = null;

/** Library Supabase dimuat hanya saat akun dipakai, agar Mode Demo dan halaman awal tetap ringan. */
function db() {
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SUPABASE_URL!, KEY!, {
      auth: { persistSession: true, storageKey: "tumbuh:auth" },
    }),
  );
  return client;
}

async function must<T>(
  p: PromiseLike<{ data: T; error: unknown }>,
): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  return data;
}

/**
 * Buat akun baru. Bila username sudah terdaftar tapi profilnya belum jadi (pendaftaran sebelumnya terputus),
 * lanjutkan dengan masuk memakai kata sandi yang sama.
 */
export async function signUpOrResume(
  username: string,
  password: string,
): Promise<{ userId: string; hasProfile: boolean }> {
  const sb = await db();
  const email = usernameToEmail(username);
  const signUp = await sb.auth.signUp({ email, password });
  if (
    signUp.error &&
    !signUp.error.message.toLowerCase().includes("already registered")
  )
    throw signUp.error;
  let userId = signUp.data.session?.user.id;
  if (!userId) {
    const signIn = await sb.auth.signInWithPassword({ email, password });
    if (signIn.error) throw signUp.error ?? signIn.error;
    userId = signIn.data.user.id;
  }
  return { userId, hasProfile: Boolean(await getMyProfile()) };
}

export async function signIn(
  username: string,
  password: string,
): Promise<string> {
  const sb = await db();
  const { data, error } = await sb.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (error) throw error;
  return data.user.id;
}

export async function signOut() {
  if (!isCloudConfigured) return;
  await (await db()).auth.signOut();
}

export async function getMyProfile(): Promise<{
  role: Account["role"];
  username: string;
} | null> {
  const sb = await db();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  return must(
    sb
      .from("profiles")
      .select("role, username")
      .eq("id", auth.user.id)
      .maybeSingle(),
  );
}

export async function registerChild(
  username: string,
  initial: SyncState,
): Promise<string> {
  return must(
    (await db()).rpc("register_child", { p_username: username, initial }),
  ) as Promise<string>;
}

export async function registerParent(
  username: string,
  code: string,
): Promise<string> {
  return must(
    (await db()).rpc("register_parent", { p_username: username, p_code: code }),
  ) as Promise<string>;
}

export async function linkChild(code: string): Promise<string> {
  return must(
    (await db()).rpc("link_child", { p_code: code }),
  ) as Promise<string>;
}

export async function getFamilyCode(childId: string): Promise<string> {
  const row = await must(
    (await db())
      .from("children")
      .select("family_code")
      .eq("id", childId)
      .single(),
  );
  return (row as { family_code: string }).family_code;
}

/** Anak-anak yang terhubung dengan akun orang tua ini (dibatasi RLS). */
export async function listMyChildren(): Promise<ChildSummary[]> {
  const rows = (await must(
    (await db()).from("children").select("id, data"),
  )) as { id: string; data: SyncState }[];
  return rows
    .filter((r) => r.data.student)
    .map((r) => ({
      id: r.id,
      nickname: r.data.student!.nickname,
      avatar: r.data.student!.avatar,
      grade: r.data.student!.grade,
    }));
}

export async function pullChild(childId: string): Promise<SyncState | null> {
  const row = await must(
    (await db())
      .from("children")
      .select("data")
      .eq("id", childId)
      .maybeSingle(),
  );
  return (row as { data: SyncState } | null)?.data ?? null;
}

export async function pushChild(
  childId: string,
  state: SyncState,
): Promise<void> {
  await must(
    (await db()).from("children").update({ data: state }).eq("id", childId),
  );
}

/** Ganti kata sandi: kata sandi lama dicek dulu dengan masuk ulang. */
export async function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string,
) {
  await signIn(username, oldPassword);
  const { error } = await (
    await db()
  ).auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/** Akun orang tua melepas tautan dengan satu anak (data anak tidak terhapus). */
export async function unlinkChild(childId: string) {
  await must(
    (await db()).from("parent_links").delete().eq("child_id", childId),
  );
}
