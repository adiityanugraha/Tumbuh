import type { Metadata } from "next";
import { BelajarView } from "@/features/child/BelajarView";

export const metadata: Metadata = {
  title: "Belajar",
  description:
    "Pilih mapel Matematika, IPAS, atau Bahasa Inggris, ulangi soal yang salah, dan belajar sambil bermain.",
};

export default function Page() {
  return <BelajarView />;
}
