# Validação

Execute `npm ci`, `npm test` e `npm run check:data` na raiz.
As suítes JSDOM verificam programas personalizados, substituições diárias,
carga do full-body aprovado, remoções/atividades, ciclos e migração de backups.
Canvas e áudio são simulados. Os testes de ciclos cobrem calendário, replanejamento,
séries, PRs, isometria, resultados, reinício e proteção contra dados incompatíveis.
A suíte `legacy-backup-roundtrip.mjs` verifica a incorporação de registros antigos,
as substituições e cargas preservadas, ausência de duplicação, exportação/reimportação,
recuperação de execução já configurada, conflitos e falhas de armazenamento.
A suíte `endomonster.mjs` confere as 12 semanas, linhas de cada tabela, cardio,
bi-sets/tri-set, técnicas em duas colunas, registros em minutos/segundos/mistos,
estatísticas sem PRs indevidos e restauração por backup.
Usa dados sintéticos; backups pessoais não devem ser adicionados ao repositório.

Teste opcional no Chromium (com Playwright disponível no Node):

```sh
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-cycles.cjs
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-endomonster.cjs
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-protocol-black.cjs
```

Ele usa um servidor efêmero local e verifica computador/celular: ativação com data,
bi-set, séries, descanso zero, prévia de replanejamento, conclusão, reinício,
persistência e rejeição de importação inválida. Não contata serviços externos.
Firebase real e instalação/offline completo da PWA não são cobertos.

O teste de navegador Endomonster cobre cardio em minutos, técnicas combinadas,
registros mistos, download real do backup, reimportação, recarga e conclusão.

`protocol-black.mjs` confere contagens por tabela, agrupamentos, células compartilhadas,
a correção de séries aprovada, duas colunas de técnicas, faixa de descanso,
registro de repetições realizadas, backup e conclusão. O teste de navegador
Protocol Black valida esses controles em computador e celular.
