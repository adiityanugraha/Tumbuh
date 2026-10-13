import type { Metadata } from "next";
import { PetaView } from "@/features/child/PetaView";

export const metadata: Metadata = {
  title: "Peta Nusantara",
  description:
    "Jelajahi 6 wilayah Nusantara, kenali tanaman khas dan budaya daerahnya.",
};

export default function Page() {
  return <PetaView />;
}
