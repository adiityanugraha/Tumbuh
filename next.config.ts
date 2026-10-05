import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: hasil build di folder out/ bisa diunggah ke hosting panitia (shared hosting, tanpa Node.js)
  output: "export",
  // /kebun -> /kebun/index.html agar Apache/cPanel bisa melayani tanpa rewrite rule
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
