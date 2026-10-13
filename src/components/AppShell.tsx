"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { currentStreak } from "@/lib/garden";
import type { Grade } from "@/lib/types";
import { useApp } from "./AppProvider";
import { Icon, Mascot, MegaMendung } from "./art";
import { RoleSwitch } from "./RoleSwitch";
import { Button, ButtonLink } from "./ui";

const NAV = [
  { href: "/kebun/", label: "Kebunku", icon: "kebun" },
  { href: "/belajar/", label: "Belajar", icon: "belajar" },
  { href: "/peta/", label: "Peta", icon: "peta" },
  { href: "/koleksi/", label: "Koleksi", icon: "koleksi" },
] as const;

/** Kerangka halaman anak: header, navigasi (atas di desktop, bawah di HP), dan penjaga profil. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, student, garden, today, account } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!ready) return;
    // Akun orang tua punya halamannya sendiri; tanpa profil kembali ke layar awal.
    if (account?.role === "ortu") router.replace("/orang-tua/");
    else if (!student) router.replace("/");
  }, [ready, student, account, router]);

  if (!ready || !student || !garden || account?.role === "ortu") {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="font-display text-daun-800 flex flex-col items-center gap-3 text-xl">
          <Mascot size={96} className="animate-bob" />
          Menyiapkan kebunmu...
        </div>
      </div>
    );
  }

  const streak = currentStreak(garden, today);

  return (
    <>
      <a
        href="#isi"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-white focus:p-3"
      >
        Lewati ke isi
      </a>
      {/* Tanpa backdrop-filter: itu akan mengurung nav fixed di HP. */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2.5 md:px-6">
          <Link
            href="/kebun/"
            className="font-display text-daun-800 flex items-center gap-2 text-3xl font-bold"
          >
            <span className="text-daun-600">
              <Icon name="kebun" size={34} />
            </span>
            Tumbuh
          </Link>
          <nav
            aria-label="Navigasi utama"
            className="border-kunyit-300 fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t-4 bg-white p-1.5 md:static md:ml-3 md:flex md:border-0 md:bg-transparent md:p-0"
          >
            {NAV.map((n) => {
              const active =
                pathname.startsWith(n.href.slice(0, -1)) ||
                (n.href === "/belajar/" &&
                  /^\/(kartu-kata|memori)/.test(pathname));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-4 text-xs font-extrabold transition md:flex-row md:gap-2 md:text-base ${active ? "bg-daun-100 text-daun-800" : "text-tinta-redup hover:bg-krem-tua hover:text-tinta"}`}
                >
                  <Icon name={n.icon} />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {/* Pengalih peran hanya untuk Mode Demo dan profil lokal. Di layar kecil ada di dialog profil. */}
            {!account && (
              <RoleSwitch active="anak" className="hidden min-[1100px]:flex" />
            )}
            <span
              className="border-tanah-300 bg-tanah-100 font-display text-tanah-700 rounded-full border-2 px-3.5 py-1.5 text-lg font-semibold whitespace-nowrap"
              title="Hari belajar berturut-turut"
            >
              🔥 {streak} hari
            </span>
            <button
              type="button"
              onClick={() => profileRef.current?.showModal()}
              aria-label="Buka profil"
              className="border-kunyit-400 bg-kunyit-100 grid size-12 cursor-pointer place-items-center rounded-full border-3 text-2xl transition hover:scale-105"
            >
              {student.avatar}
            </button>
          </div>
        </div>
        <div className="bg-parang h-1" />
      </header>
      <MegaMendung className="pointer-events-none -mb-10 block h-16 w-full" />
      <main
        id="isi"
        className="relative mx-auto max-w-7xl overflow-x-clip px-4 pb-28 md:px-6 md:pb-12"
      >
        {children}
      </main>
      <ProfileDialog dialogRef={profileRef} />
    </>
  );
}

function ProfileDialog({
  dialogRef,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}) {
  const { student, setGrade, reset, account, logout } = useApp();
  const router = useRouter();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!student) return null;
  const isChildAccount = account?.role === "anak";
  const close = () => {
    setConfirmReset(false);
    dialogRef.current?.close();
  };
  return (
    <dialog
      ref={dialogRef}
      onClose={() => setConfirmReset(false)}
      className="rounded-blob border-krem-tua backdrop:bg-tinta/40 m-auto w-[min(92vw,440px)] border-3 p-6"
    >
      <div className="flex items-center gap-3">
        <span className="border-kunyit-400 bg-kunyit-100 grid size-16 place-items-center rounded-full border-3 text-4xl">
          {student.avatar}
        </span>
        <div>
          <p className="font-display text-2xl font-semibold">
            {student.nickname}
          </p>
          <p className="text-tinta-redup font-bold">Kelas {student.grade}</p>
        </div>
      </div>
      {isChildAccount ? (
        <>
          <div className="bg-kunyit-100 mt-5 rounded-[20px] p-4 text-center">
            <p className="text-sogan font-extrabold">Kode keluarga</p>
            <p
              className="font-display text-daun-800 mt-1 text-4xl font-semibold tracking-[0.3em]"
              aria-label={`Kode keluarga ${(account.familyCode ?? "").split("").join(" ")}`}
            >
              {account.familyCode}
            </p>
            <p className="text-tinta-redup mt-1 text-sm font-bold">
              Berikan kode ini ke orang tuamu agar bisa memantau kebunmu dari
              HP-nya.
            </p>
          </div>
          <p className="text-tinta-redup mt-4 text-sm font-bold">
            Masuk sebagai {account.username}. Kelas hanya bisa diganti oleh
            orang tua.
          </p>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            <Button
              variant="ghost"
              onClick={async () => {
                close();
                await logout();
                router.replace("/");
              }}
            >
              Keluar
            </Button>
            <Button onClick={close}>Tutup</Button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sogan mt-5 font-extrabold">Ganti kelas</p>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {([1, 2, 3, 4, 5, 6] as Grade[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                aria-pressed={student.grade === g}
                className={`font-display min-h-14 cursor-pointer rounded-2xl border-3 text-2xl font-semibold ${student.grade === g ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua hover:border-daun-300 bg-white"}`}
              >
                {g}
              </button>
            ))}
          </div>
          <p className="text-sogan mt-5 font-extrabold">Untuk orang tua</p>
          <ButtonLink
            href="/orang-tua/"
            variant="ghost"
            className="mt-2 w-full text-lg"
          >
            Buka halaman orang tua
          </ButtonLink>
          <div className="mt-6 flex flex-wrap justify-between gap-3">
            {confirmReset ? (
              <Button
                variant="kunyit"
                onClick={async () => {
                  close();
                  await reset();
                }}
              >
                Ya, hapus semua
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-tanah-700 min-h-12 cursor-pointer font-bold underline"
              >
                Mulai dari awal
              </button>
            )}
            <Button onClick={close}>Tutup</Button>
          </div>
          {confirmReset && (
            <p className="text-tanah-700 mt-3 text-sm font-bold">
              Kebun dan koleksimu akan dihapus dari perangkat ini.
            </p>
          )}
        </>
      )}
    </dialog>
  );
}
