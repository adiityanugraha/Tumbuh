/** Username: 3-20 huruf, angka, atau garis bawah. Tidak peka huruf besar-kecil. */
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export const normalizeUsername = (name: string) => name.trim().toLowerCase();

export function usernameError(name: string): string | null {
  return USERNAME_RE.test(normalizeUsername(name))
    ? null
    : "Nama pengguna 3-20 karakter: huruf, angka, atau garis bawah, tanpa spasi.";
}

export const passwordError = (password: string): string | null =>
  password.length >= 6 ? null : "Kata sandi minimal 6 karakter.";

/** Supabase Auth butuh email: username dipetakan ke email internal yang tidak pernah dikirimi surat. */
export const usernameToEmail = (name: string) =>
  `${normalizeUsername(name)}@tumbuh.app`;

/** Ubah pesan error teknis (Supabase/database) menjadi kalimat yang mudah dipahami. */
export function authErrorText(error: unknown): string {
  const msg = String(
    (error as { message?: string } | null)?.message ?? error,
  ).toLowerCase();
  if (msg.includes("invalid login credentials"))
    return "Nama pengguna atau kata sandi salah.";
  if (
    msg.includes("already registered") ||
    msg.includes("sudah dipakai") ||
    msg.includes("duplicate key")
  )
    return "Nama pengguna sudah dipakai. Coba nama lain.";
  if (msg.includes("kode tidak ditemukan"))
    return "Kode keluarga tidak ditemukan. Periksa lagi, ya.";
  if (msg.includes("akun orang tua"))
    return 'Akun ini terdaftar sebagai orang tua. Pilih "Saya Orang Tua".';
  if (msg.includes("akun anak"))
    return 'Akun ini terdaftar sebagai anak. Pilih "Aku Anak".';
  if (msg.includes("password")) return "Kata sandi minimal 6 karakter.";
  return "Gagal tersambung. Periksa internet lalu coba lagi.";
}
