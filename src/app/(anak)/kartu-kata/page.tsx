import type { Metadata } from "next";
import { KartuKataView } from "@/features/child/KartuKataView";

export const metadata: Metadata = {
  title: "Kartu Kata",
  description:
    "Kartu kosakata Bahasa Inggris bergambar dengan suara untuk anak SD.",
};

export default function Page() {
  return <KartuKataView />;
}
