"use client";

import * as React from "react";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { PageHeader } from "@/components/shell/page-header";
import { DataTable, type Column } from "@/components/data/data-table";
import { users } from "@/mocks/plataforma";
import type { User } from "@/types/domain";
import { toast } from "sonner";
import { SettingsLayout } from "@/components/layouts";

const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.string().min(1, "Selecione o papel"),
});
type InviteForm = z.infer<typeof inviteSchema>;

export default function UsuariosPage() {
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });

  const columns: Column<User>[] = [
    {
      key: "name", header: "Usuário",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-100 text-micro font-semibold text-navy-900">
            {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
          </span>
          <div>
            <p className="font-medium text-gray-800">{u.name}</p>
            <p className="text-caption text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: "roles", header: "Papéis", render: (u) => <span className="flex flex-wrap gap-1">{u.roles.map((r) => <Badge key={r} variant="navy">{r}</Badge>)}</span> },
    { key: "companies", header: "Escopo", render: (u) => <span className="text-muted-foreground">{u.companies.join(", ")}</span> },
    { key: "last", header: "Último acesso", render: (u) => <span className="tnum">{u.lastAccess}</span> },
    {
      key: "status", header: "Status",
      render: (u) => (
        <Badge variant={u.status === "active" ? "success" : u.status === "invited" ? "info" : "default"} dot>
          {u.status === "active" ? "Ativo" : u.status === "invited" ? "Convidado" : "Desativado"}
        </Badge>
      ),
    },
  ];

  const onInvite = (data: InviteForm) => {
    setInviteOpen(false);
    reset();
    toast.success(`Convite enviado a ${data.email}`, { description: `Papel: ${data.role} · expira em 7 dias · reenviável.` });
  };

  return (
    <SettingsLayout>
      <PageHeader
        title="Usuários e Permissões"
        description="Tenant Ore Investments · 8 papéis base · acesso por empresa"
        actions={<Button onClick={() => setInviteOpen(true)}><UserPlus /> Convidar usuário</Button>}
      />

      <DataTable
        columns={columns}
        rows={users}
        onRowClick={(u) =>
          toast.info(`${u.name}`, { description: "Detalhe do usuário (papéis por empresa + atividade recente) — drawer na v1.1." })
        }
      />

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogTitle>Convidar usuário</DialogTitle>
          <DialogDescription>O convidado recebe e-mail com link de aceite. A conta nasce com papel e escopo configurados.</DialogDescription>
          <form onSubmit={handleSubmit(onInvite)} className="mt-4 space-y-4">
            <div>
              <Label>E-mail corporativo</Label>
              <Input placeholder="nome@empresa.com.br" {...register("email")} />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div>
              <Label>Papel</Label>
              <select
                {...register("role")}
                defaultValue=""
                className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="" disabled>Selecione…</option>
                <option>Sócio / Diretoria</option>
                <option>Analista do fundo</option>
                <option>CFO/Controller</option>
                <option>Gestor de área</option>
                <option>Aprovador</option>
                <option>Auditor/Conselheiro (convidado)</option>
                <option>Operador de integração</option>
              </select>
              {errors.role && <p className="mt-1 text-xs text-danger">{errors.role.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancelar</Button>
              <Button type="submit">Enviar convite</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SettingsLayout>
  );
}
