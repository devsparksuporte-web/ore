"use client";

/**
 * Provider de visibilidade de apresentação. Escopo = rota: ocultar um bloco na
 * Performance da Ativa não afeta a Performance da Morro Verde.
 *
 * Fora de um provider, `useVisibility` devolve um estado inerte (`enabled:
 * false`): componentes que consultam o hook continuam funcionando, apenas não
 * oferecem o controle. Assim o DS não fica dependente do módulo.
 *
 * O estado de verdade é o `useState` — é ele que dispara o render. O
 * `VisibilityStore` recebe uma cópia a cada mudança: hoje o adaptador em
 * memória não faz nada de especial com ela, mas é esse ponto que um adaptador
 * persistente ocupa quando existir "salvar meu layout".
 */
import * as React from "react";
import { usePathname } from "next/navigation";
import { createMemoryStore, type BlockId, type VisibilityStore } from "./types";

interface VisibilityValue {
  /** Há provider? Componentes do DS usam isto para decidir se oferecem o menu. */
  enabled: boolean;
  hidden: BlockId[];
  isHidden(id: BlockId): boolean;
  hide(id: BlockId, label?: string): void;
  show(id: BlockId): void;
  showAll(): void;
  /** Rótulo legível de um bloco oculto, para o aviso de retorno. */
  labelOf(id: BlockId): string;
}

const INERTE: VisibilityValue = {
  enabled: false,
  hidden: [],
  isHidden: () => false,
  hide: () => {},
  show: () => {},
  showAll: () => {},
  labelOf: (id) => id,
};

const Ctx = React.createContext<VisibilityValue>(INERTE);

export function PresentationProvider({
  children, store,
}: {
  children: React.ReactNode;
  /** Injetável — troca o adaptador de persistência sem tocar consumidores. */
  store?: VisibilityStore;
}) {
  const pathname = usePathname() ?? "/";
  const storeRef = React.useRef<VisibilityStore | null>(null);
  if (storeRef.current === null) storeRef.current = store ?? createMemoryStore();

  const [porRota, setPorRota] = React.useState<Record<string, BlockId[]>>({});
  const rotulos = React.useRef<Map<BlockId, string>>(new Map());

  const hidden = React.useMemo(() => porRota[pathname] ?? [], [porRota, pathname]);

  const aplicar = React.useCallback(
    (rota: string, proximo: (atual: BlockId[]) => BlockId[]) => {
      setPorRota((anterior) => {
        const lista = proximo(anterior[rota] ?? []);
        storeRef.current?.write(rota, lista);
        return { ...anterior, [rota]: lista };
      });
    },
    []
  );

  const value = React.useMemo<VisibilityValue>(
    () => ({
      enabled: true,
      hidden,
      isHidden: (id) => hidden.includes(id),
      hide: (id, label) => {
        if (label) rotulos.current.set(id, label);
        aplicar(pathname, (atual) => (atual.includes(id) ? atual : [...atual, id]));
      },
      show: (id) => aplicar(pathname, (atual) => atual.filter((x) => x !== id)),
      showAll: () => aplicar(pathname, () => []),
      labelOf: (id) => rotulos.current.get(id) ?? id,
    }),
    [hidden, pathname, aplicar]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVisibility(): VisibilityValue {
  return React.useContext(Ctx);
}
