import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Tumbuh - Kebun Belajar Nusantara",
    template: "%s | Tumbuh",
  },
  description:
    "Belajar Matematika, IPAS, dan Bahasa Inggris untuk anak SD kelas 1-6 sambil merawat kebun virtual dan menjelajah Peta Nusantara.",
};

export const viewport: Viewport = {
  themeColor: "#2e7d4f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
