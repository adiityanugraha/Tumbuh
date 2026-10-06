import type { Metadata } from "next";
import { KebunView } from "@/features/child/KebunView";

export const metadata: Metadata = { title: "Kebunku" };

export default function Page() {
  return <KebunView />;
}
