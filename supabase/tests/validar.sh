#!/usr/bin/env bash
# Aplica todas as migrations num Postgres descartável e reporta o que falhar.
#   bash supabase/tests/validar.sh
# Requer Docker. Não toca em nenhum projeto Supabase.
set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
IMG="${PG_IMAGE:-postgres:15}"
CT=ore-pg-validacao

docker version >/dev/null 2>&1 || { echo "Docker nao esta rodando."; exit 1; }
docker rm -f "$CT" >/dev/null 2>&1
docker run -d --name "$CT" -e POSTGRES_PASSWORD=pg -e POSTGRES_DB=ore "$IMG" >/dev/null || exit 1
docker exec "$CT" bash -c 'for i in $(seq 1 60); do pg_isready -U postgres -d ore >/dev/null 2>&1 && exit 0; sleep 1; done; exit 1' \
  || { echo "Postgres nao subiu."; exit 1; }

docker cp "$ROOT/supabase/tests/stub-supabase.sql" "$CT:/00_stub.sql" >/dev/null
docker cp "$ROOT/supabase/migrations" "$CT:/migrations" >/dev/null

falhas=0
run() {
  echo "---- $2"
  docker exec "$CT" psql -v ON_ERROR_STOP=1 -U postgres -d ore -q -f "$1" 2>&1 | sed 's/^/    /'
  if [ "${PIPESTATUS[0]}" -ne 0 ]; then echo "    >>> FALHOU"; falhas=$((falhas+1)); fi
}
run /00_stub.sql "stub do Supabase"
for f in $(docker exec "$CT" bash -c 'ls /migrations/*.sql | sort'); do run "$f" "$(basename "$f")"; done

echo "== conferencias =="
docker exec "$CT" psql -U postgres -d ore -c \
  "select count(*) as tabelas_sem_rls from pg_tables where schemaname='public' and not rowsecurity;"
docker exec "$CT" psql -U postgres -d ore -c \
  "select role_key, count(*) as capacidades from public.role_capabilities group by 1 order by 2 desc;"
docker exec "$CT" psql -U postgres -d ore -c \
  "select count(*) as capacidades_negadas_a_convidado from public.role_capabilities
     where role_key='investidores' and (capability_key like 'pipeline.%' or capability_key like 'config.%'
        or capability_key like 'usuarios.%' or capability_key='relatorios.exportar');"

docker rm -f "$CT" >/dev/null 2>&1
[ "$falhas" -eq 0 ] && echo "OK: todas as migrations aplicaram." || echo "FALHAS: $falhas"
exit "$falhas"
