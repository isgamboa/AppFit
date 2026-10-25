# AppFit — Treino

Aplicativo de treino, atividades e acompanhamento corporal em HTML, CSS e JavaScript.
Funciona localmente e offline, sem cadastro obrigatório. Este é o fork
[isgamboa/AppFit](https://github.com/isgamboa/AppFit), baseado em
[DUK22/AppFit](https://github.com/DUK22/AppFit).

## Programas com duração e execuções independentes

Todos os programas exigem **data de início em uma segunda-feira** e **duração de
1 a 12 semanas** para começar uma execução. Isso se aplica aos programas padrão,
aos personalizados e aos modelos anteriores. Salvar um modelo não o ativa.

- **Programas padrão periodizados:** exercícios, séries e técnicas podem variar
  em cada dia de cada semana; a duração é definida pelo programa.
- **Programas semanais anteriores:** a programação semanal se repete pela duração
  informada na ativação. O ABCDE original mantém a alternância C1/C2 e D1/D2.
- **Programas personalizados:** continuam com editor de três sessões ABC ou full-body,
  escolha dos dias e uma duração em semanas. Não há editor manual de 84 sessões.

O modelo do programa é separado de cada execução. Alterações no modelo personalizado
valem para novas execuções; o planejamento iniciado mantém sua cópia. Reiniciar cria
outra execução, preservando resultados e históricos anteriores, inclusive quando
existem registros de duas execuções na mesma data.

### Boost PRO Ombro

Primeiro programa padrão com variação diária, transcrito de quatro PDFs fornecidos:
**4 semanas, 20 sessões de segunda a sexta e 174 prescrições**, com nível
intermediário/avançado e ênfase em hipertrofia de ombros. Sábado e domingo são descanso.
Exercícios repetidos com prescrições diferentes têm identificadores separados.

O programa está na lista de seleção. Os links dos PDFs não foram utilizados.
Novos exercícios receberam grupo muscular e busca de execução no YouTube. Veja os
dados e os critérios de conversão em [data/standard-programs](data/standard-programs/README.md).
Outros programas periodizados podem ter até 12 semanas, com até 84 sessões.
A inclusão de PDFs é um processo de análise/carga no desenvolvimento, sem upload de PDF no app.

## Como usar

Baixe o [index.html](index.html) e abra no navegador. Nenhuma instalação de dependências
é necessária para usar o aplicativo. Dados ficam no navegador; mantenha backups antes
de trocar de dispositivo, endereço ou navegador.

1. Em **Hoje → trocar treino**, escolha um programa.
2. Informe a segunda-feira de início e a quantidade de semanas. Nos periodizados,
   a duração vem preenchida e é fixa.
3. Confirme o início. **Hoje** e **Semana** exibem a sessão correspondente à data,
   identificando a semana do programa.
4. Registre carga e repetições e marque as séries concluídas. A ação de conclusão
   do exercício e **Marcar tudo como feito** continuam disponíveis como atalhos.

Modelos antigos ou dados sem início/duração ficam com **Configuração pendente** até
que esses campos sejam informados. Isso não apaga os registros anteriores.

### Faltas e replanejamento

Por padrão, o programa avança pelo calendário, mesmo quando há faltas. A ação
**Retomar a última sessão perdida** apresenta uma prévia das datas afetadas.
Após confirmação, a sessão perdida mais recente passa para hoje; as datas posteriores
sem realização são deslocadas pelo mesmo intervalo, incluindo os descansos.

Sessões com séries concluídas ou valores já registrados não são deslocadas. Isso
protege sessões parciais e os dados anotados. Conflitos de datas são recusados sem
alterar o planejamento. Faltas anteriores à sessão retomada permanecem no histórico.
Os dias da semana podem mudar, e a execução pode durar mais de 12 semanas no calendário:
o limite se refere à programação original, não ao prolongamento por faltas.

### Técnicas, descanso e substituições

As prescrições mostram técnica e descanso por exercício. **Bi-sets e tri-sets**
têm cabeçalho com os participantes, números dos exercícios e destaque visual em
cada integrante. As técnicas como Drop-set, Rest-pause e No-stop são exibidas;
a execução interna de suas etapas permanece manual.

O cronômetro respeita o descanso prescrito, inclusive **zero segundos**. Para exercícios
sem descanso específico, usa o valor dos Ajustes. Isometrias mostram segundos no
campo da série e não entram no cálculo de PR de 1RM.

As substituições do catálogo valem apenas para aquele dia e mantêm as metas de séries
e repetições. Cargas, repetições e marcas de conclusão permanecem associadas ao exercício
selecionado. Voltar à escolha anterior restaura seus valores. O botão **Execução** usa
a URL do catálogo; exercícios manuais sem cadastro usam busca no YouTube.

### Conclusão e resultados

Concluir a última sessão agendada abre automaticamente os resultados. O programa
não reinicia sozinho. Se o prazo passar sem concluir essa sessão, a página identifica
o prazo encerrado e permite consultar os resultados ou replanejar uma falta.

As estatísticas incluem:

- Dias treinados versus planejados: um dia treinado exige ao menos uma série concluída.
- Sessões completas, parciais/com registros, faltas e adesão.
- Séries planejadas e realizadas por grupo muscular principal, sem duplicar auxiliares.
- Duração original e calendário após replanejamento.
- Exercícios com novo PR de 1RM estimado (Epley), comparado ao histórico disponível
  quando a execução foi criada; apenas séries concluídas entram nesse resultado.

Nessa página ficam **Reiniciar programa** e **Selecionar outro programa**. Os resultados
também estão acessíveis pela aba **Execuções e resultados**, separada da aba
**Programas** na seleção de treinos.

## Meus programas e recursos mantidos

Em **trocar treino → Criar meu treino**, escolha ABC ou full-body, informe a duração,
defina três dias distintos e monte as sessões A, B e C. É possível adicionar exercícios
do banco, editar séries/repetições/observações, remover e reordenar. Salve vários
programas, duplique-os e escolha qual executar.

Continuam disponíveis: programas ABCDE, Saitama, Ramon Dino, Arnold e CBum;
registro de cargas; vídeos de execução; gráficos e recordes gerais; calculadoras
de 1RM e anilhas; aquecimento e alongamento; peso, medidas e fotos; atividades físicas;
exportação/importação e sincronização opcional. As variações C/D do ABCDE podem ser
invertidas, com confirmação, nas sessões futuras sem registros da execução.

Dieta, metas de ingestão de kcal/macros, refeições, alimentos, TMB e controle de água
foram removidos, inclusive seus dados antigos. Os gastos de atividades permanecem.
Muay Thai, Boxe, Basquete, Ciclismo e Natação não aparecem em novos registros;
os históricos dessas atividades foram preservados. Padel e Remo olímpico estão disponíveis.

A estimativa de atividades é `MET × peso × horas`, com fatores 0,85 (leve) e 1,15
(intensa), usando o último peso ou 75 kg de referência. **Padel usa aproximação de
6 MET por tênis em duplas; Remo olímpico usa aproximação de 7 MET para esforço
moderado na água. Esses dois valores são provisórios e não foram validados em uma
fonte específica acessível neste ambiente.** O aviso aparece na interface.

## Backups, migração e privacidade

Em **⚙️ Ajustes**, exporte um backup JSON ou importe no outro aparelho. O formato
atual usa `schemaVersion: 2`, incluindo execuções, calendários, ajustes e séries.
O backup é validado por inteiro antes de substituir o estado atual.

Arquivos anteriores precisam da data de início e da duração do programa. Ao configurar,
a opção **Incorporar registros antigos deste programa dentro do período informado**
vem selecionada e mostra as datas encontradas. Somente registros com identificação
explícita do mesmo programa e dentro do calendário são incorporados. Datas, prescrições,
cargas, repetições e substituições são preservadas, mesmo se o modelo mudou depois.
Exercícios marcados como concluídos na versão antiga confirmam suas séries existentes;
séries sem confirmação permanecem pendentes. As semanas e estatísticas passam a usar
esses registros. A referência de PR usa o histórico anterior à data de início.

Se a execução já foi configurada sem o histórico, use **Incorporar histórico anterior**
no cartão do programa em Hoje. A prévia pede confirmação e não sobrescreve registros
existentes dessa execução. Registros de outro programa, fora do período ou sem
identificação suficiente permanecem no **Histórico legado**, em Progresso.
Os originais incorporados ficam arquivados no backup da execução para auditoria;
as séries ativas são transferidas uma única vez, evitando contagem duplicada.

A exportação valida o estado e inclui ciclos e dados incorporados; reimportar o novo
backup restaura os vínculos sem configurar novamente. Falhas de armazenamento ao criar
ou incorporar uma execução preservam o estado anterior. Dados de ingestão retirados
do app não são restaurados.

Formato inválido ou versão futura não substituem os dados atuais. Se os dados já
salvos no navegador forem incompatíveis, o app mantém o conteúdo original, oferece
sua exportação para recuperação e aguarda um backup válido. A mesma validação protege
a entrada pela sincronização.

A sincronização automática é opcional: siga [CONFIGURAR-SYNC.md](CONFIGURAR-SYNC.md).
Quando ativada, envia os dados ao projeto Firebase configurado. Fotos permanecem no
aparelho e podem ser transferidas pelo backup. O uso local não exige conta.
Firebase e links do YouTube exigem internet.

## PWA

Para instalar como aplicativo, hospede em HTTPS ou sirva em localhost. Inclua
`index.html`, `sw.js`, `manifest.webmanifest` e os três ícones PNG. Abrir somente o
HTML local não registra o service worker; a instalação depende do navegador.
O HTML continua autocontido para execução local.

## Desenvolvimento e verificação

Node.js 24 e Python 3 foram usados na validação. Para instalar e servir:

```sh
npm ci
python3 -m http.server 8000 --bind 127.0.0.1
```

Após editar o motor ou os dados, atualize o HTML autocontido:

```sh
python3 scripts/import-exercises.py
python3 scripts/import-programs.py
python3 scripts/embed-cycles.py
npm test
npm run check:data
```

`src/cycles.js` contém o motor de execuções. Os JSONs em `data/standard-programs/`
contêm programas padrão periodizados, e `data/programas/` mantém o modelo full-body
aprovado anteriormente. O catálogo atual tem **153 exercícios**, com cinco campos
de origem no [CSV](exports/banco-exercicios-appfit.csv). Não há servidor de banco de dados.

Os testes usam JSDOM com canvas e áudio simulados. Há também teste opcional de
navegador, que requer Playwright disponível no Node e Chromium instalado:

```sh
CHROMIUM_PATH=/usr/bin/chromium node tests/browser-cycles.cjs
```

Foram verificados os fluxos em telas de computador e celular. Essas verificações
não substituem teste com Firebase real ou validação completa da instalação/offline da PWA.
Arquivos auxiliares `_*.js`, `_*.mjs` e cópias HTML herdadas não são a suíte atual;
use `npm test`.

## Autoria e licença

Baseado no trabalho de [DUK22/AppFit](https://github.com/DUK22/AppFit), com
personalizações mantidas por [isgamboa](https://github.com/isgamboa).
O README original declara “Livre para uso pessoal” e sugere MIT; o `package.json`
declara ISC. Não há arquivo `LICENSE` neste checkout. Essas informações são
preservadas, sem atribuir uma nova licença ao código original.
