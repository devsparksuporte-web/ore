/**
 * VISIBILIDADE DE APRESENTAÇÃO (M-PRES · Fase 5.2)
 *
 * O que este módulo É: um controle de COMPOSIÇÃO DA TELA. Serve a quem vai
 * apresentar o portfólio e quer deixar fora da projeção um bloco que não é
 * assunto daquela reunião.
 *
 * O que este módulo NÃO É — e não deve virar:
 *  · não é controle de acesso. Ocultar um bloco não protege dado nenhum:
 *    o conteúdo continua carregado, continua no DOM da própria sessão e
 *    continua acessível a quem tem a permissão. Quem decide acesso é
 *    @modules/permissions (ADR-021), e a fronteira real é o backend.
 *  · não altera, apaga nem arquiva dado. Mostrar de novo devolve o bloco
 *    exatamente como estava.
 *  · não muda a autorização de ninguém, nem esconde resposta de API.
 *
 * Escopo do estado: a SESSÃO em curso. Recarregar a página devolve todos os
 * blocos. É deliberado — uma escolha feita para uma reunião não deve
 * sobreviver silenciosamente até a próxima.
 */

/** Chave de um bloco dentro de um escopo (normalmente, a rota). */
export type BlockId = string;

/**
 * PORT de persistência. Hoje só existe o adaptador em memória. Quando houver
 * "salvar meu layout" (por usuário, por perfil de apresentação), o novo
 * adaptador entra AQUI — nenhum consumidor muda.
 */
export interface VisibilityStore {
  /** Blocos ocultos neste escopo. */
  read(scope: string): BlockId[];
  /** Grava a lista completa de ocultos do escopo. */
  write(scope: string, hidden: BlockId[]): void;
}

/** Adaptador vigente: memória da sessão (perde-se ao recarregar, por decisão). */
export function createMemoryStore(): VisibilityStore {
  const mapa = new Map<string, BlockId[]>();
  return {
    read: (scope) => mapa.get(scope) ?? [],
    write: (scope, hidden) => { mapa.set(scope, hidden); },
  };
}
