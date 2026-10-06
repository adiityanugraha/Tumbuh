import type { Metadata } from "next";
import { PetaView } from "@/features/child/PetaView";

export const metadata: Metadata = { title: "Peta Nusantara" };

export default function Page() {
  return <PetaView />;
}
