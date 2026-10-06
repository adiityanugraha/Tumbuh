import type { Metadata } from "next";
import { BelajarView } from "@/features/child/BelajarView";

export const metadata: Metadata = { title: "Belajar" };

export default function Page() {
  return <BelajarView />;
}
