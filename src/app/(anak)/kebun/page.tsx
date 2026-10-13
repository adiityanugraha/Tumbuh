import type { Metadata } from "next";
import { KebunView } from "@/features/child/KebunView";

export const metadata: Metadata = {
  title: "Kebunku",
  description: "Rawat tanamanmu, lihat lencana, dan tantangan dari orang tua.",
};

export default function Page() {
  return <KebunView />;
}
