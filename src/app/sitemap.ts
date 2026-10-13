import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Wajib untuk output: "export": dibuat sekali saat build jadi file statis.
export const dynamic = "force-static";

const ROUTES = [
  "/",
  "/kebun/",
  "/belajar/",
  "/peta/",
  "/koleksi/",
  "/kartu-kata/",
  "/memori/",
  "/orang-tua/",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
