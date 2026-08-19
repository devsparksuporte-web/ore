import { MainLayout } from "@/components/layouts";
import { PresentationProvider } from "@modules/presentation";

/**
 * Route group (app): todo módulo autenticado herda o MainLayout
 * (skip-link + sidebar + topbar + landmark main). Ver components/layouts.
 *
 * Fase 5.2 — o PresentationProvider envolve tudo para que qualquer bloco possa
 * ser retirado da composição durante uma apresentação. O estado vive na
 * sessão e é por rota; nada é gravado e nada de dado muda.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <PresentationProvider>
      <MainLayout>{children}</MainLayout>
    </PresentationProvider>
  );
}
