import type { Metadata } from "next";
import { MemoriView } from "@/features/child/MemoriView";

export const metadata: Metadata = {
  title: "Memori Nusantara",
  description: "Permainan memori tanaman khas Nusantara.",
};

export default function Page() {
  return <MemoriView />;
}
