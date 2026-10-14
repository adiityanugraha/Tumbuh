// Alamat situs final (domain Hostinger, deploy lewat Dokploy). Bisa ditimpa NEXT_PUBLIC_SITE_URL saat build.
// Dipakai untuk sitemap, robots, dan tautan Open Graph.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://tumbuhnusantara.my.id"
).replace(/\/$/, "");
