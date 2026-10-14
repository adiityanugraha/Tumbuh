import Link from "next/link";

const ROLES = [
  { href: "/kebun/", label: "Anak", id: "anak" },
  { href: "/orang-tua/", label: "Orang Tua", id: "orang-tua" },
] as const;

/** Pengalih peran Mode Demo: juri bisa berpindah sisi tanpa login. */
export function RoleSwitch({
  active,
  className = "",
}: {
  active: (typeof ROLES)[number]["id"];
  className?: string;
}) {
  return (
    <nav
      aria-label="Mode Demo: pilih peran"
      className={`bg-krem-tua items-center rounded-full p-1 text-sm font-extrabold ${className}`}
    >
      <span className="text-sogan px-2.5 text-xs">Mode Demo</span>
      {ROLES.map((r) => (
        <Link
          key={r.id}
          href={r.href}
          aria-current={active === r.id ? "page" : undefined}
          className={`grid min-h-10 place-items-center rounded-full px-3.5 transition ${active === r.id ? "bg-kartu text-tinta shadow-sm" : "text-tinta-redup hover:text-tinta"}`}
        >
          {r.label}
        </Link>
      ))}
    </nav>
  );
}
