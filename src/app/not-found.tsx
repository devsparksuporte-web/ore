import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <p className="font-display text-6xl font-bold text-navy-100">404</p>
      <h1 className="font-display text-xl font-semibold text-navy-900">Página não encontrada</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        O endereço pode ter mudado ou você não tem acesso a este conteúdo neste contexto.
      </p>
      <div className="flex gap-2">
        <Link href="/portfolio/overview"><Button>Ir ao Dashboard</Button></Link>
        <Link href="/selecionar-contexto"><Button variant="outline">Trocar contexto</Button></Link>
      </div>
    </div>
  );
}
