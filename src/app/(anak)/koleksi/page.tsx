import type { Metadata } from "next";
import { KoleksiView } from "@/features/child/KoleksiView";

export const metadata: Metadata = {
  title: "Koleksi Tanaman",
  description:
    "Koleksi kartu fakta tanaman khas Nusantara yang sudah kamu tumbuhkan.",
};

export default function Page() {
  return <KoleksiView />;
}
