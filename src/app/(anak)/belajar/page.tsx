import type { Metadata } from "next";
import { BelajarView } from "@/features/child/BelajarView";

export const metadata: Metadata = {
  title: "Belajar",
  description:
    "Soal Hari Ini, 4 mapel (Matematika, Bahasa Indonesia, IPAS, Bahasa Inggris), latihan per topik, dan belajar sambil bermain.",
};

export default function Page() {
  return <BelajarView />;
}
