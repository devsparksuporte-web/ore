"use client";

/**
 * Login · herda AuthLayout (variant split — painel institucional + form).
 * Lógica intacta (RHF + navegação). Composição visual do painel vive em
 * components/layouts/auth-layout.tsx.
 */
import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { AuthLayout } from "@/components/layouts";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => router.push("/selecionar-contexto"), 600);
  };

  return (
    <AuthLayout variant="split">
      <div className="anim-rise w-full max-w-[400px]" style={{ animationDelay: "60ms" }}>
        <div className="mb-8 lg:hidden">
          <span className="font-display text-lg font-semibold text-navy-900">ORE Investments</span>
        </div>

        <div className="rounded-lg border bg-surface/85 p-8 shadow-md backdrop-blur-sm">
          <h2 className="font-display text-h1 font-semibold tracking-display text-navy-900">Acessar a plataforma</h2>
          <p className="mt-1.5 text-body-sm text-gray-500">Credenciais corporativas.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
            <div className="anim-rise" style={{ animationDelay: "120ms" }}>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="nome@empresa.com.br" autoComplete="email" className="h-11" {...register("email")} />
              {errors.email && <p className="mt-1.5 text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div className="anim-rise" style={{ animationDelay: "160ms" }}>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" className="h-11" {...register("password")} />
              {errors.password && <p className="mt-1.5 text-xs text-danger">{errors.password.message}</p>}
            </div>

            {/* Botão premium: gradiente sutil + elevação + seta que desliza */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "group flex h-11 w-full items-center justify-center gap-2 rounded text-sm font-medium text-white",
                "bg-gradient-to-b from-action-600 to-action-700 shadow-sm",
                "transition-[box-shadow,transform,filter] duration-fast ease-standard",
                "hover:shadow-md hover:brightness-[1.06] active:translate-y-px active:shadow-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-disabled"
              )}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5" aria-hidden />
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => toast.success("Verifique sua caixa de entrada.", { description: "Se o e-mail existir, as instruções foram enviadas." })}
            className="mt-5 text-body-sm font-medium text-action-600 transition-colors duration-fast hover:text-action-700 hover:underline"
          >
            Esqueci minha senha
          </button>
        </div>

        <p className="anim-fade mt-6 text-center text-caption text-gray-400" style={{ animationDelay: "220ms" }}>
          Ambiente de demonstração · dados fictícios
        </p>
      </div>
    </AuthLayout>
  );
}
