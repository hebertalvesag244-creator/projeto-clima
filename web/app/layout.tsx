import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "Clima Agora | Projeto Clima", description: "Acompanhe a previsão do tempo da sua cidade." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
