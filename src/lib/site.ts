// Alamat situs final (subdomain dari domain panitia, deploy lewat Dokploy). Bisa ditimpa NEXT_PUBLIC_SITE_URL saat build.
// Dipakai untuk sitemap, robots, dan tautan Open Graph.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://tumbuhnusantara.m1sec.my.id"
).replace(/\/$/, "");
