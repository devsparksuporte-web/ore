/**
 * MainLayout · Strata (Sprint 04b)
 * Shell autenticado do produto: skip-link acessível, Sidebar navy fixa,
 * Topbar e landmark main. TODO módulo autenticado herda este layout
 * (hoje via app/(app)/layout.tsx). Não renderiza container de página —
 * isso é papel do DashboardLayout/SettingsLayout.
 */
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <a
        href="#conteudo"
        className="sr-only z-toast rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div className="lg:pl-60">
        <Topbar />
        <main id="conteudo" className="outline-none" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
