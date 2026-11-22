import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escola de Lutas Rafael Mota",
  description: "Gestão e portal da Escola de Lutas Rafael Mota."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
