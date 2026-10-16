Execute `npm ci` e `node tests/custom-programs.mjs` na raiz do projeto.

A suíte usa JSDOM, com canvas e áudio simulados. Verifica criação, validação,
ativação, duplicação, reordenação, exclusão, histórico, persistência, payload
Firebase, restauração remota, escape de nomes e navegação nas abas existentes.
Não substitui validação de instalação da PWA e sincronização Firebase real.
