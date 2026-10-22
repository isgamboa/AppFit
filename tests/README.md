Execute `npm ci` e `node tests/custom-programs.mjs` na raiz do projeto.

A suíte usa JSDOM, com canvas e áudio simulados. Verifica criação, validação,
ativação, duplicação, reordenação, exclusão, histórico, persistência, payload
Firebase, restauração remota, escape de nomes e navegação nas abas existentes.
Não substitui validação de instalação da PWA e sincronização Firebase real.

Execute também `node tests/daily-substitutions.mjs` para verificar as escolhas
diárias, os links do CSV, a separação dos registros por exercício, a restauração
dos valores, o progresso e a persistência das substituições.
Use `python3 scripts/import-exercises.py --check` para conferir toda a carga do CSV.

Execute `node tests/seeded-programs.mjs` para validar o programa aprovado,
a carga única, a não ativação e a preservação dos dados e edições existentes.
Use `python3 scripts/import-programs.py --check` para comparar o JSON ao HTML.
