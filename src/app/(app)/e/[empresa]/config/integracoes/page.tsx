"use client";

/**
 * FONTES DE DADOS (Sprint 1.4 · item 3).
 *
 * Era "Integrações": cards de conector com selo "Saudável", última e próxima
 * sincronização, contagem de registros, botão Sincronizar com toasts
 * encadeados, tabela de logs de execução (incluindo uma falha técnica
 * fabricada) e diálogo de desconexão. Nada disso existia — a ORE fornece
 * documentos, não integração. Foi o achado que reprovou a auditoria de aceite.
 *
 * Agora a tela responde a UMA pergunta: de onde vêm os dados que o Crystal
 * apresenta? Não é uma central de integrações e não deve virar uma.
 *
 * Rota, posição no menu, layout, grid e componentes preservados: a mudança é
 * de conceito e conteúdo, não de desenho.
 */
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shell/page-header";
import { SourceCaption } from "@/components/data/source-caption";
import { listConnections } from "@modules/settings";
import { DATA_STATUS_LABEL, type DataStatus } from "@modules/data-source";
import { SettingsLayout } from "@/components/layouts";

/** Tom do selo por estado do dado — vocabulário do Design System, sem cor nova. */
const statusVariant: Record<DataStatus, "success" | "warning" | "default" | "danger"> = {
  REAL: "success",
  AGUARDANDO_DADOS: "warning",
  DEMONSTRATIVO: "warning",
  NAO_DISPONIVEL: "default",
  PLANEJADO: "default",
};

export default function FontesDeDadosPage() {
  const fontes = listConnections();
  const disponiveis = fontes.filter((f) => f.dataStatus === "REAL");
  const demais = fontes.filter((f) => f.dataStatus !== "REAL");

  return (
    <SettingsLayout spacing="md">
      <PageHeader
        title="Fontes de dados"
        description="Documentos e fontes que sustentam as informações apresentadas na plataforma"
      />

      <Secao
        titulo="Em uso"
        descricao="Fontes já incorporadas pela plataforma."
        fontes={disponiveis}
      />

      <Secao
        titulo="Ainda não disponíveis"
        descricao="Fontes previstas ou aguardando disponibilização. Nada aqui alimenta a plataforma hoje."
        fontes={demais}
      />

      <div>
        <SourceCaption source="A atualização das fontes é feita hoje pela Ore — a plataforma não busca documentos automaticamente" />
      </div>
    </SettingsLayout>
  );
}

function Secao({
  titulo,
  descricao,
  fontes,
}: {
  titulo: string;
  descricao: string;
  fontes: ReturnType<typeof listConnections>;
}) {
  if (fontes.length === 0) return null;
  return (
    <section>
      <div className="mb-4">
        <h2 className="font-display text-body font-medium tracking-snug text-navy-900">{titulo}</h2>
        <p className="mt-0.5 text-caption text-gray-500">{descricao}</p>
      </div>

      {/* Mesmo grid de 3 colunas da tela anterior. */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {fontes.map((f) => (
          <div key={f.id} className="border-t pt-3.5">
            <div className="flex items-start justify-between gap-3 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-navy-100">
                  <FileText className="h-4 w-4 text-navy-900" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-body-sm font-medium leading-5 text-navy-900">{f.connector}</p>
                  <p className="text-caption text-gray-500">{f.companyName}</p>
                </div>
              </div>
              <Badge variant={statusVariant[f.dataStatus]} dot>
                {DATA_STATUS_LABEL[f.dataStatus]}
              </Badge>
            </div>

            <p className="text-body-sm leading-6 text-gray-600">{f.detail}</p>

            {/* Só aparece quando a relação está comprovada no código. */}
            {f.usedBy && f.usedBy.length > 0 && (
              <div className="mt-4 border-t pt-2.5">
                <p className="text-caption text-gray-500">Usada em</p>
                <p className="mt-1 text-caption text-gray-700">{f.usedBy.join(" · ")}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
