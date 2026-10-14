// VERIFY: alamat situs final. Set NEXT_PUBLIC_SITE_URL saat build (contoh: https://tumbuh.domain-panitia.id),
// dipakai untuk sitemap, robots, dan tautan Open Graph.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://tumbuh.example.com"
).replace(/\/$/, "");
