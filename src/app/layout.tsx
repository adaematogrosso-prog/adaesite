import type { Metadata, Viewport } from "next";
import { Cinzel, Source_Sans_3 } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import { SITE_SHORT_NAME } from "@/lib/constants";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ADAE-MT | Associação DeMolay Alumni Estadual de Mato Grosso",
  description:
    "Plataforma oficial da Associação DeMolay Alumni Estadual de Mato Grosso para gerenciamento de atividades dos DeMolays Sêniors.",
  applicationName: SITE_SHORT_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_SHORT_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/imagenspublicas/logoalumni2.png",
    apple: "/imagenspublicas/logoalumni2.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#002366",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cinzel.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
