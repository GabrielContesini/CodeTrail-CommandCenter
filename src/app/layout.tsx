import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
