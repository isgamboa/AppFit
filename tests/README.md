# Validação

Execute `npm ci`, `npm test` e `npm run check:data` na raiz.
As suítes JSDOM verificam programas personalizados, substituições diárias,
carga do full-body aprovado, remoções/atividades, ciclos e migração de backups.
Canvas e áudio são simulados. Os testes de ciclos cobrem calendário, replanejamento,
séries, PRs, isometria, resultados, reinício e proteção contra dados incompatíveis.

Teste opcional no Chromium (com Playwright disponível no Node):

```sh
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-cycles.cjs
```

Ele usa um servidor efêmero local e verifica computador/celular: ativação com data,
bi-set, séries, descanso zero, prévia de replanejamento, conclusão, reinício,
persistência e rejeição de importação inválida. Não contata serviços externos.
Firebase real e instalação/offline completo da PWA não são cobertos.
