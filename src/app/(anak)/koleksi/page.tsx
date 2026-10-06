import type { Metadata } from "next";
import { KoleksiView } from "@/features/child/KoleksiView";

export const metadata: Metadata = { title: "Koleksi Tanaman" };

export default function Page() {
  return <KoleksiView />;
}
