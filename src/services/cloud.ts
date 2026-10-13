import type { SupabaseClient } from "@supabase/supabase-js";
import type { SyncState } from "@/lib/types";

/**
 * Sinkronisasi opsional lewat Supabase (lihat supabase/schema.sql).
 * Aktif hanya bila NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY diisi saat build.
 * Anon key memang publik: keamanan data dijaga Row Level Security di database.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isCloudConfigured = Boolean(SUPABASE_URL && KEY);

const CODE_KEY = "tumbuh:keluarga";

/** Kode keluarga perangkat ini (disimpan lokal). Hanya dipanggil di client. */
export const familyCode = {
  get: (): string | null => {
    try {
      return localStorage.getItem(CODE_KEY);
    } catch {
      return null;
    }
  },
  set: (code: string) => localStorage.setItem(CODE_KEY, code),
  clear: () => localStorage.removeItem(CODE_KEY),
};

let client: Promise<SupabaseClient> | null = null;

/** Library Supabase dimuat hanya saat sinkronisasi dipakai, agar halaman lain tetap ringan. */
function db() {
  client ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(SUPABASE_URL!, KEY!, {
      auth: { persistSession: true, storageKey: "tumbuh:auth" },
    }),
  );
  return client;
}

/** Login anonim: tanpa email atau kata sandi, sesi disimpan di perangkat ini. */
async function signedIn() {
  const sb = await db();
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    const { error } = await sb.auth.signInAnonymously();
    if (error) throw error;
  }
  return sb;
}

export async function createFamily(state: SyncState): Promise<string> {
  const sb = await signedIn();
  const { data, error } = await sb.rpc("create_family", { initial: state });
  if (error) throw error;
  return data as string;
}

export async function joinFamily(code: string): Promise<SyncState> {
  const sb = await signedIn();
  const { data, error } = await sb.rpc("join_family", {
    family_code: code.trim().toUpperCase(),
  });
  if (error) throw error;
  return data as SyncState;
}

export async function pullFamily(code: string): Promise<SyncState | null> {
  const sb = await signedIn();
  const { data, error } = await sb
    .from("families")
    .select("data")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as SyncState | undefined) ?? null;
}

export async function pushFamily(
  code: string,
  state: SyncState,
): Promise<void> {
  const sb = await signedIn();
  const { error } = await sb
    .from("families")
    .update({ data: state, updated_at: new Date().toISOString() })
    .eq("code", code);
  if (error) throw error;
}
