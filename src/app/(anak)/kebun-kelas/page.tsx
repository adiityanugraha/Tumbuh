import type { Metadata } from "next";
import { KebunKelasView } from "@/features/child/KebunKelasView";

export const metadata: Metadata = { title: "Kebun Kelas" };

export default function Page() {
  return <KebunKelasView />;
}
