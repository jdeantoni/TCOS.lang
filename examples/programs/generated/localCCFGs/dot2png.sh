#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
for f in *.dot; do
  [ -e "$f" ] || continue
  out="${f%.dot}.png"
  echo "Generating $out"
  dot -Tpng "$f" -o "$out"
done
echo "Done."