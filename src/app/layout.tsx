import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-fira-sans",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
});

export const metadata: Metadata = {
  title: "CodeTrail Command Center",
  description:
    "Painel operacional para monitoramento de usuarios, telemetria do app CodeTrail, sincronizacao e saude da frota.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${firaSans.variable} ${firaCode.variable}`}>
      <body className="font-sans antialiased bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-[var(--accent)]/20">
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
