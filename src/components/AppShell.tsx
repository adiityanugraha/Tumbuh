"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { currentStreak } from "@/lib/garden";
import { useApp } from "./AppProvider";
import { Icon, Mascot, MegaMendung } from "./art";
import { RoleSwitch } from "./RoleSwitch";
import { SettingsButton } from "./SettingsDialog";

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
        className="focus:bg-kartu sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-xl focus:p-3"
      >
        Lewati ke isi
      </a>
      {/* Tanpa backdrop-filter: itu akan mengurung nav fixed di HP. */}
      <header className="bg-kartu sticky top-0 z-30">
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
            className="border-kunyit-300 bg-kartu fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 gap-1 border-t-4 p-1.5 md:static md:ml-3 md:flex md:border-0 md:bg-transparent md:p-0"
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
            <SettingsButton variant="anak" />
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
    </>
  );
}
