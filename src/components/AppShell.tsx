"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { currentStreak } from "@/lib/garden";
import type { Grade } from "@/lib/types";
import { useApp } from "./AppProvider";
import { Icon, Mascot, MegaMendung } from "./art";
import { Button } from "./ui";

const NAV = [
  { href: "/kebun/", label: "Kebunku", icon: "kebun" },
  { href: "/belajar/", label: "Belajar", icon: "belajar" },
  { href: "/peta/", label: "Peta", icon: "peta" },
  { href: "/koleksi/", label: "Koleksi", icon: "koleksi" },
] as const;

/** Kerangka halaman anak: header, navigasi (atas di desktop, bawah di HP), dan penjaga profil. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, student, garden, today } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const profileRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (ready && !student) router.replace("/");
  }, [ready, student, router]);

  if (!ready || !student || !garden) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="flex flex-col items-center gap-3 font-display text-xl text-daun-800">
          <Mascot size={96} className="animate-bob" />
          Menyiapkan kebunmu...
        </div>
      </div>
    );
  }

  const streak = currentStreak(garden, today);

  return (
    <>
      <a href="#isi" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:bg-white focus:p-3">
        Lewati ke isi
      </a>
      {/* Tanpa backdrop-filter: itu akan mengurung nav fixed di HP. */}
      <header className="sticky top-0 z-30 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2.5 md:px-6">
          <Link href="/kebun/" className="flex items-center gap-2 font-display text-3xl font-bold text-daun-800">
            <span className="text-daun-600">
              <Icon name="kebun" size={34} />
            </span>
            Tumbuh
          </Link>
          <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t-4 border-kunyit-300 bg-white p-1.5 md:static md:ml-3 md:flex md:border-0 md:bg-transparent md:p-0"
          >
            {NAV.map((n) => {
              const active = pathname.startsWith(n.href.slice(0, -1));
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
            <span
              className="rounded-full border-2 border-tanah-300 bg-tanah-100 px-3.5 py-1.5 font-display text-lg font-semibold whitespace-nowrap text-tanah-700"
              title="Hari belajar berturut-turut"
            >
              🔥 {streak} hari
            </span>
            <button
              type="button"
              onClick={() => profileRef.current?.showModal()}
              aria-label="Buka profil"
              className="grid size-12 cursor-pointer place-items-center rounded-full border-3 border-kunyit-400 bg-kunyit-100 text-2xl transition hover:scale-105"
            >
              {student.avatar}
            </button>
          </div>
        </div>
        <div className="h-1 bg-parang" />
      </header>
      <MegaMendung className="pointer-events-none -mb-10 block h-16 w-full" />
      <main id="isi" className="relative mx-auto max-w-7xl px-4 pb-28 md:px-6 md:pb-12">
        {children}
      </main>
      <ProfileDialog dialogRef={profileRef} />
    </>
  );
}

function ProfileDialog({ dialogRef }: { dialogRef: React.RefObject<HTMLDialogElement | null> }) {
  const { student, setGrade, reset } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  if (!student) return null;
  const close = () => {
    setConfirmReset(false);
    dialogRef.current?.close();
  };
  return (
    <dialog
      ref={dialogRef}
      onClose={() => setConfirmReset(false)}
      className="m-auto w-[min(92vw,440px)] rounded-blob border-3 border-krem-tua p-6 backdrop:bg-tinta/40"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-16 place-items-center rounded-full border-3 border-kunyit-400 bg-kunyit-100 text-4xl">{student.avatar}</span>
        <div>
          <p className="font-display text-2xl font-semibold">{student.nickname}</p>
          <p className="font-bold text-tinta-redup">Kelas {student.grade}</p>
        </div>
      </div>
      <p className="mt-5 font-extrabold text-sogan">Ganti kelas</p>
      <div className="mt-2 grid grid-cols-6 gap-2">
        {([1, 2, 3, 4, 5, 6] as Grade[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGrade(g)}
            aria-pressed={student.grade === g}
            className={`min-h-14 cursor-pointer rounded-2xl border-3 font-display text-2xl font-semibold ${student.grade === g ? "border-daun-800 bg-daun-600 text-white" : "border-krem-tua bg-white hover:border-daun-300"}`}
          >
            {g}
          </button>
        ))}
      </div>
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
          <button type="button" onClick={() => setConfirmReset(true)} className="min-h-12 cursor-pointer font-bold text-tanah-700 underline">
            Mulai dari awal
          </button>
        )}
        <Button onClick={close}>Tutup</Button>
      </div>
      {confirmReset && <p className="mt-3 text-sm font-bold text-tanah-700">Kebun dan koleksimu akan dihapus dari perangkat ini.</p>}
    </dialog>
  );
}
