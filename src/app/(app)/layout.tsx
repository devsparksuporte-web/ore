import { MainLayout } from "@/components/layouts";

/**
 * Route group (app): todo módulo autenticado herda o MainLayout
 * (skip-link + sidebar + topbar + landmark main). Ver components/layouts.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
