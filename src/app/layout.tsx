import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { AppProvider } from "@/components/AppProvider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

const DESCRIPTION =
  "Belajar Matematika, Bahasa Indonesia, IPAS, dan Bahasa Inggris untuk anak SD kelas 1-6 sambil merawat kebun virtual dan menjelajah Peta Nusantara.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tumbuh - Kebun Belajar Nusantara",
    template: "%s | Tumbuh",
  },
  description: DESCRIPTION,
  applicationName: "Tumbuh",
  keywords: [
    "belajar anak SD",
    "Kurikulum Merdeka",
    "Matematika",
    "IPAS",
    "Bahasa Indonesia",
    "Bahasa Inggris",
    "kebun virtual",
    "Nusantara",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Tumbuh",
    title: "Tumbuh - Kebun Belajar Nusantara",
    description: DESCRIPTION,
    images: [
      {
        url: "/tanaman/kecil/rafflesia.webp",
        width: 300,
        height: 300,
        alt: "Padma Raksasa di kebun Tumbuh",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2e7d4f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
