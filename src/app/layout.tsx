import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

/**
 * Hierarquia tipográfica moderna (Premium Polish):
 * Inter Tight — títulos e KPIs (tracking negativo, pesos contidos 500/600)
 * Inter — UI, corpo e dados (tnum). Leitura confortável, sem excesso de peso.
 */
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600"] });

export const metadata: Metadata = {
  title: "Ore Investments · Plataforma de Inteligência e Governança",
  description: "Inteligência e governança corporativa para o portfólio Ore Mining Investments",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Anti-flash do tema: aplica a classe antes do primeiro paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("crystal-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${interTight.variable} font-sans antialiased`}>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
