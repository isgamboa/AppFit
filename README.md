# AppFit — Treino

App de musculação, atividades físicas e acompanhamento corporal, em português.
Monte um ABC ou full-body, siga programas com variação entre semanas e acompanhe
cargas, séries e resultados. Funciona com um único HTML, localmente e offline,
sem cadastro obrigatório.

Este é o fork [isgamboa/AppFit](https://github.com/isgamboa/AppFit), baseado no
trabalho de [DUK22/AppFit](https://github.com/DUK22/AppFit). As personalizações são
mantidas neste repositório. Não são abertos pull requests para o projeto original.

## Começar a usar

1. [Baixe o HTML da versão principal](https://github.com/isgamboa/AppFit/raw/refs/heads/main/index.html)
   e abra o arquivo no navegador. Se o link abrir o código, use **Salvar como**.
2. Em **Hoje → trocar treino**, selecione um programa padrão ou crie o seu.
3. Informe a **data de início, em uma segunda-feira**, e a **duração de 1 a 12 semanas**.
   Nos programas com variação entre semanas, a duração é definida pelo próprio programa.
4. Em **Hoje**, registre carga e repetições e marque as séries concluídas.
   Consulte o planejamento e os registros diários em **Semana**.

O aplicativo não precisa de instalação de dependências nem de servidor para abrir
o HTML local. Os dados ficam no navegador: exporte um backup antes de trocar de
aparelho, navegador ou endereço de acesso. Vídeos e sincronização exigem internet.

## Programas e planejamento

Todos os treinos têm início e duração definidos, inclusive os personalizados e os
modelos importados de versões anteriores. Salvar um modelo não inicia a execução.
Há um programa ativo por vez, com históricos independentes para cada execução.

| Tipo | Como funciona |
| --- | --- |
| Padrão com variação entre semanas | Exercícios, séries, técnicas e descansos podem variar a cada dia, por até 12 semanas. |
| Padrão semanal | A programação semanal se repete durante o período escolhido. O ABCDE mantém a alternância C1/C2 e D1/D2. |
| Personalizado ABC ou full-body | Editor de três sessões, dias da semana escolhidos pelo usuário e duração de 1 a 12 semanas. |

Os programas padrão incluem **ABCDE + Full Body**, **Saitama**, **Ramon Dino**,
**Arnold**, **CBum**, **Boost PRO Ombro** e **Endomonster**. Também está disponível o modelo personalizado
**Full-body | Força, Hipertrofia e Condicionamento (v1.1)**, com sessões na terça,
quinta e sábado, carregado a partir da planilha aprovada.

### Criar e gerenciar seus treinos

Em **trocar treino → Criar meu treino**, escolha ABC ou full-body, dê um nome ao
programa, informe a duração e defina três dias distintos. Nas sessões A, B e C,
adicione exercícios do catálogo, ajuste séries, repetições e observações, remova
ou reordene exercícios. Você pode salvar vários modelos, editá-los e duplicá-los.

Cada execução mantém uma cópia do planejamento. Editar o modelo vale para novas
execuções; reiniciar cria outra execução e preserva os resultados anteriores.
Registros de execuções diferentes na mesma data também ficam separados.

A seleção de treinos tem duas abas: **Programas**, para escolher e criar treinos,
e **Execuções e resultados**, para consultar o histórico e as estatísticas.

### Boost PRO Ombro

Programa padrão de **4 semanas**, com **20 sessões de segunda a sexta**, descanso
no fim de semana e **174 prescrições de exercícios**. Tem nível intermediário/avançado
e ênfase em hipertrofia de ombros. Exercícios repetidos com prescrições diferentes
são mantidos como entradas distintas.

O programa foi transcrito de quatro PDFs. Os links dos documentos não foram
reutilizados; novos exercícios receberam grupo muscular e links de busca no YouTube.
Os critérios e dados estão em [data/standard-programs](data/standard-programs/README.md).
A inclusão de outros programas por PDF é feita no desenvolvimento; não há importador
de PDF nem editor manual de até 84 sessões na interface do app.

### Endomonster

Programa padrão intermediário de **12 semanas**, com **72 sessões de segunda a
sábado** e descanso aos domingos. São **505 prescrições**, incluindo **69 blocos
de cardio**, **27 bi-sets** e **1 tri-set**. As sessões e a divisão muscular variam
entre as semanas. As duas colunas de técnicas dos PDFs são preservadas.

O cardio é registrado em minutos, com a carga desabilitada, e aparece separado
das séries musculares nas estatísticas. Ele participa da conclusão da sessão,
sem criar automaticamente uma atividade ou estimativa de kcal. Prescrições mistas,
como `10+15s`, aceitam repetições e segundos no mesmo campo e ficam fora dos PRs
de 1RM. Os PDFs originais e seus links não são incorporados ao aplicativo.

### Faltas e replanejamento

O planejamento avança pelo calendário, mesmo quando você falta. A opção
**Retomar a última sessão perdida** mostra uma prévia e, após confirmação, traz
para hoje a sessão perdida mais recente. As datas posteriores sem realização são
deslocadas pelo mesmo intervalo, incluindo os descansos.

Sessões com séries concluídas ou valores registrados mantêm suas datas. Conflitos
de datas são recusados sem alterar o planejamento. Faltas anteriores à sessão
retomada permanecem no histórico. O replanejamento pode mudar os dias da semana
e prolongar o calendário além de 12 semanas; o limite vale para o programa original.

## Executar o treino

- Registre **carga e repetições por série** e marque cada série concluída. Concluir
  um exercício ou usar **Marcar tudo como feito** funciona como atalho.
- Consulte a técnica e o descanso de cada prescrição. **Bi-sets e tri-sets** mostram
  claramente os exercícios integrantes, com cabeçalho e destaque visual.
- Use o cronômetro com o descanso prescrito, inclusive zero segundos. Sem prescrição
  específica, vale o tempo definido em Ajustes. Há opção de descanso automático.
- Consulte o vídeo pelo botão **Execução** e troque o exercício pelas substituições
  sugeridas ou pelo catálogo durante aquela sessão.

As substituições valem apenas para aquele dia e mantêm as metas de séries e
repetições. Cargas e conclusões ficam associadas ao exercício efetivamente escolhido;
voltar à escolha anterior restaura seus valores. Exercícios manuais sem URL cadastrada
usam uma busca no YouTube.

Drop-set, Rest-pause e outras técnicas são exibidas como prescritas; o controle das
etapas dessas técnicas continua manual. Isometrias por tempo usam segundos no registro. Cardio usa minutos; prescrições
mistas de repetições com isometria preservam os dois valores. Esses registros
não entram no cálculo de PR de 1RM. Aquecimento, alongamento, calculadoras de 1RM
e anilhas e a inversão das variações C/D do ABCDE continuam disponíveis. A inversão
pede confirmação e afeta somente sessões futuras sem registros.

## Resultados e progresso

Ao concluir a última sessão agendada, o app abre os resultados do programa,
mesmo que existam faltas anteriores. O programa não reinicia automaticamente.
Se o prazo terminar sem essa conclusão, a tela indica prazo encerrado e permite
consultar os resultados ou replanejar uma falta.

As estatísticas de cada execução mostram:

- Dias treinados versus planejados, sessões completas e parciais, faltas e adesão.
- Séries planejadas e realizadas por grupo muscular principal, sem duplicar músculos auxiliares.
- Duração original, calendário atual e prolongamento por replanejamento.
- PRs de 1RM estimado pela fórmula de Epley, comparados ao histórico anterior à data de início.

Um dia treinado exige ao menos uma série concluída. Apenas séries concluídas entram
no volume realizado e nos PRs do programa. Registros sem confirmação continuam
visíveis como dados parciais. Na tela de resultados, você pode voltar, **Reiniciar
programa** ou **Selecionar outro programa**. O histórico fica em **Execuções e resultados**.

As abas **Corpo** e **Progresso** mantêm o acompanhamento de peso, medidas, fotos,
gráficos, cargas e recordes gerais por exercício.

## Atividades físicas

Registre duração, intensidade e, quando aplicável, distância. O app calcula uma
estimativa de gasto energético: `MET × peso em kg × duração em horas`, com fator
0,85 para intensidade leve, 1 para moderada e 1,15 para intensa. Usa o último peso
registrado ou 75 kg de referência.

**Padel** usa aproximação de **6 MET**, baseada em tênis em duplas; **Remo olímpico**
usa **7 MET**, como aproximação de esforço moderado na água. Esses valores são
provisórios e não foram validados em uma fonte específica; o aviso também aparece no app.

Muay Thai, Boxe, Basquete, Ciclismo e Natação foram retirados das opções para novos
registros, preservando seus históricos. Controle de água, dieta, refeições, metas
de ingestão de kcal/macros e TMB foram removidos. O gasto estimado das atividades
permanece disponível.

## Backup, importação e dados antigos

Em **⚙️ Ajustes**, exporte ou importe um arquivo JSON. O formato atual usa
`schemaVersion: 2` e inclui programas, execuções, calendários, ajustes, séries e
os demais dados do app. A exportação valida os dados; a importação valida o arquivo
antes de substituir o conteúdo atual. **Importar substitui os dados atuais; não é
uma combinação de dois backups.** Guarde uma cópia antes de importar.

### Importar uma versão anterior

1. Importe o backup em Ajustes. Caso faltem início ou duração, o app mostra
   **Configuração pendente**.
2. Configure a data de início e a quantidade de semanas do programa.
3. Mantenha marcada **Incorporar registros antigos deste programa dentro do período
   informado**. A prévia informa as datas encontradas e os registros fora do período.
4. Confirme: os registros compatíveis passam a aparecer em **Semana** e nas
   estatísticas da execução, com datas, prescrições, cargas, repetições e substituições preservadas.

Somente registros identificados como pertencentes ao mesmo programa e dentro do
calendário são incorporados. A prescrição histórica é preservada mesmo quando o
modelo foi alterado depois. Na versão antiga, a marcação de exercício concluído
confirma suas séries existentes; séries sem confirmação permanecem pendentes.

Se a execução já foi criada sem incorporar o histórico, use **Incorporar histórico
anterior** no cartão do programa em Hoje ou nas estatísticas, quando disponível.
A ação apresenta uma prévia e não sobrescreve registros dessa execução.

Registros de outro programa, fora do período ou sem identificação suficiente
continuam no **Histórico legado**, em Progresso. Os originais incorporados são
arquivados no backup da execução para auditoria, e as séries ativas são transferidas
uma única vez, evitando contagem duplicada. Dados de dieta e água removidos não são restaurados.

### Exportar e restaurar a versão atual

Um novo backup mantém os vínculos entre registros e execuções. Ao reimportá-lo,
o app restaura o calendário e as estatísticas sem exigir configuração novamente.
Arquivos inválidos ou de versão futura não substituem os dados atuais. Falhas de
armazenamento ao importar, iniciar ou incorporar uma execução preservam os dados anteriores.

Se o conteúdo salvo no navegador não puder ser carregado, o app oferece **Salvar
dados originais** para recuperação e aguarda um backup válido. A mesma validação
de entrada também protege a sincronização.

## Armazenamento, sincronização e instalação

O app usa o armazenamento local do navegador; não há servidor de banco de dados
obrigatório. Limpar os dados do navegador pode apagar os registros locais.
A sincronização com Firebase é opcional: veja [CONFIGURAR-SYNC.md](CONFIGURAR-SYNC.md).
Quando ativada, envia os dados ao projeto configurado. As fotos permanecem no
aparelho e podem ser transferidas por backup. O uso local não exige conta.

Para instalar como **PWA**, hospede em HTTPS ou sirva em localhost, incluindo
`index.html`, `sw.js`, `manifest.webmanifest`, `icon-192.png`, `icon-512.png` e
`apple-touch-icon.png`. A instalação depende do navegador. Abrir apenas o HTML
local funciona sem registrar o service worker; o arquivo continua autocontido.

## Desenvolvimento e validação

A interface usa HTML, CSS e JavaScript, sem etapa de build obrigatória para uso.
Node.js 24 e Python 3 foram usados no desenvolvimento. Para instalar as dependências
de teste e servir os arquivos localmente:

```sh
npm ci
python3 -m http.server 8000 --bind 127.0.0.1
```

Abra `http://127.0.0.1:8000`. Os principais arquivos são:

| Caminho | Conteúdo |
| --- | --- |
| [index.html](index.html) | Aplicativo completo para uso local e hospedagem. |
| [src/cycles.js](src/cycles.js) | Motor de execuções, calendários, resultados e migração. |
| [data/standard-programs/](data/standard-programs/README.md) | Programas padrão com variação entre semanas. |
| [data/programas/](data/programas/) | Modelo full-body aprovado e incorporado ao app. |
| [exports/banco-exercicios-appfit.csv](exports/banco-exercicios-appfit.csv) | Catálogo com 188 exercícios: nome, grupo muscular, duas substituições e URL de vídeo. |
| [tests/](tests/README.md) | Suítes automatizadas e instruções de validação. |

Após alterar o motor ou os dados, atualize as cópias embutidas no HTML e valide:

```sh
python3 scripts/import-exercises.py
python3 scripts/import-programs.py
python3 scripts/embed-cycles.py
npm test
npm run check:data
```

A suíte cobre programas personalizados, substituições, atividades, calendários,
replanejamento, conclusão, PRs e migração, incluindo exportação/reimportação de
histórico antigo, conflitos e falhas de armazenamento. Canvas e áudio são simulados
no JSDOM. O teste opcional de navegador requer Playwright disponível no Node e Chromium:

```sh
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-cycles.cjs
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-endomonster.cjs
```

Os fluxos foram verificados em computador e celular. Firebase real e a instalação
e operação offline completa da PWA não são cobertos por essa suíte. Arquivos auxiliares
`_*.js`, `_*.mjs` e cópias HTML herdadas não são a suíte atual; use `npm test`.

## Autoria e licença

Baseado no trabalho de [DUK22/AppFit](https://github.com/DUK22/AppFit), com
personalizações mantidas por [isgamboa](https://github.com/isgamboa).
O README original declara “Livre para uso pessoal” e sugere MIT; o `package.json`
declara ISC. Não há arquivo `LICENSE` neste checkout. Essas informações são
preservadas, sem atribuir uma nova licença ao código original.
