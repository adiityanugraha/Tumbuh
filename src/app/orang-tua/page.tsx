import type { Metadata } from "next";
import { ParentView } from "@/features/parent/ParentView";

export const metadata: Metadata = {
  title: "Orang Tua",
  description: "Laporan belajar mingguan anak dan Kirim Semangat dari orang tua.",
};

export default function Page() {
  return <ParentView />;
}
