#!/usr/bin/env bash
# Regenera supabase/aplicar-manual.sql a partir das migrations, na ordem.
# Rode sempre que editar qualquer arquivo de supabase/migrations/.
set -eu
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/supabase/aplicar-manual.sql"
HDR="$ROOT/supabase/tests/cabecalho-manual.txt"

cat "$HDR" > "$OUT"
for f in "$ROOT"/supabase/migrations/*.sql; do
  printf '\n\n/* ###########################################################################\n   %s\n   ########################################################################### */\n\n' "$(basename "$f")" >> "$OUT"
  cat "$f" >> "$OUT"
done
echo "gerado: $OUT ($(wc -l < "$OUT") linhas)"
