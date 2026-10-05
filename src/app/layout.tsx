import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Kebun Belajar Nusantara",
    template: "%s | Kebun Belajar Nusantara",
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
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
