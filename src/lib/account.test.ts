import { describe, expect, it } from "vitest";
import {
  authErrorText,
  passwordError,
  usernameError,
  usernameToEmail,
} from "./account";

describe("akun", () => {
  it("validasi username dan kata sandi", () => {
    expect(usernameError("Dewi_3")).toBeNull();
    expect(usernameError("ab")).not.toBeNull();
    expect(usernameError("dewi sari")).not.toBeNull();
    expect(passwordError("12345")).not.toBeNull();
    expect(passwordError("123456")).toBeNull();
  });

  it("username dipetakan ke email internal tanpa peka huruf besar", () => {
    expect(usernameToEmail(" Dewi ")).toBe("dewi@tumbuh.app");
  });

  it("pesan error ramah untuk anak dan orang tua", () => {
    expect(authErrorText({ message: "Invalid login credentials" })).toBe(
      "Nama pengguna atau kata sandi salah.",
    );
    expect(authErrorText({ message: "User already registered" })).toContain(
      "sudah dipakai",
    );
    expect(authErrorText({ message: "kode tidak ditemukan" })).toContain(
      "Kode keluarga tidak ditemukan",
    );
    expect(authErrorText(new Error("Failed to fetch"))).toContain(
      "Gagal tersambung",
    );
  });
});
