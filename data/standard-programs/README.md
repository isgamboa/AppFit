# Programas padrão com variação semanal

Cada JSON declara `id`, nome, autor, duração de 1 a 12 semanas e `weeks`.
Cada semana tem dias (`weekday`: domingo=0), título e lista ordenada de exercícios.
Cada ocorrência tem identificador próprio, inclusive quando o nome se repete.
As prescrições têm `series`, `reps` em texto, `restSeconds` (zero é válido),
`technique`, a segunda coluna opcional `technique2` e, quando aplicável, `groupId` e `groupType` (Bi-set/Tri-set).
Descanso ausente na fonte usa `restSeconds: null`, sem inventar um valor.
Cardio usa `kind: "cardio"`, `durationUnit: "minutes"` e `durationMinutes`;
isometrias por tempo usam `durationUnit: "seconds"`, e prescrições mistas usam
`durationUnit: "mixed"`. Dias ausentes são descanso. O registro do catálogo é localizado pelo nome canônico.

O Boost PRO Ombro foi transcrito dos quatro PDFs enviados pelo usuário:
4 semanas, 20 sessões, 174 prescrições e 13 bi-sets. Nomes e termos originais
permanecem em `sourceName`; arquivos de origem e hashes constam em `sources`.
Os links e os próprios PDFs não são incorporados ao app.

A importação específica pode ser reproduzida com:

```sh
python3 scripts/import-boost-pdfs.py /diretorio/dos/pdfs
python3 scripts/import-exercises.py
python3 scripts/embed-cycles.py
npm run check:data
```

O importador depende de `pdftotext`. Os agrupamentos deste material foram
conferidos visualmente; o script é específico destes quatro PDFs, não um leitor
genérico de planilhas de qualquer formato. Outros programas devem ser transcritos
e revisados antes de gerar seus JSONs.

## Catálogo e nomes

A carga inicial do Boost ampliou o catálogo de 94 para 153 exercícios;
o Endomonster adicionou outros 35, totalizando 188. Correspondências sem ambiguidade
(por exemplo ABS Máquina → Abdominal máquina) reaproveitam o catálogo. Variações
unilaterais, equipamentos e ângulos diferentes não são colapsados. Nomes genéricos
como Supino Reto e Crucifixo Inverso permanecem genéricos, sem inventar equipamento.
O erro de grafia Rsoca Scott foi corrigido para Rosca Scott.

Novos cadastros têm grupo principal e URL de busca no YouTube pelo próprio nome;
não foram inventadas substituições. Os links dos PDFs foram ignorados. Para
conferência anatômica foi consultada a base pública:
https://github.com/yuhonas/free-exercise-db/blob/main/dist/exercises.json

Exemplos de correspondências pesquisadas: Front Squat (Clean Grip) → quadríceps;
Thigh Adductor → adutores; Reverse Flyes/Front Incline Dumbbell Raise → ombros;
Cable Wrist Curl → antebraços; Straight-Arm Pulldown → dorsais; Preacher Curl →
bíceps; Barbell Deadlift → lombar como grupo principal. Grupos de cadastros
reaproveitados foram mantidos para preservar a classificação já existente.
As estatísticas de séries usam somente o grupo principal, sem duplicar auxiliares.

O HTML é autocontido: mudanças no código em `src/cycles.js` e nos JSONs exigem
`python3 scripts/embed-cycles.py`. `--check` verifica a igualdade entre fontes e HTML.

## Endomonster

Transcrição dos 12 PDFs enviados: 12 semanas, 72 sessões (segunda a sábado),
505 prescrições, 69 blocos de cardio, 27 bi-sets e 1 tri-set. O nível intermediário
consta na capa. Os nomes e a grafia de origem ficam em `sourceName`, com nomes
canônicos do catálogo em `nome`; arquivos e hashes ficam em `sources`.
Dados pessoais dos rodapés e hyperlinks dos documentos não são incluídos.

```sh
python3 scripts/import-endomonster-pdfs.py /diretorio/dos/pdfs
python3 scripts/import-exercises.py
python3 scripts/embed-cycles.py
npm run check:data
```

Este importador é específico dos PDFs fornecidos. As contagens de linhas são
verificadas por dia e semana; as bordas dos grupos foram conferidas visualmente.
O tri-set da quinta-feira da semana 8 contém Desenvolvimento com Halteres,
Elevação Lateral e Elevação Frontal. Duas ocorrências de Elevação Lateral na
quinta da semana 11 permanecem separadas, com as prescrições diferentes da fonte.

Particularidades preservadas:

- Não há cardio na quinta-feira das semanas 2, 3 e 4; não foram preenchidas lacunas.
- Há 3.275 minutos prescritos de cardio. O descanso está ausente em 68 blocos;
  o da sexta-feira da semana 2 traz 90 segundos. O cronômetro usa o padrão do usuário
  quando a fonte não define descanso.
- As colunas Técnica e Técnica 2 ficam separadas nos dados e ambas são exibidas,
  inclusive quando a primeira está vazia. As combinações e eventuais inconsistências
  da fonte foram mantidas, como `set.21` e `Drop-Set` nas duas sessões de Rosca 21
  da semana 9 e a segunda técnica ISOMETRIA no Afundo no Smith daquela quarta-feira.
- `10+15s` e `10+10s` são registros mistos, sem conversão para repetições ou segundos
  isolados. A prancha até a falha registra tempo em segundos, sem duração inventada.
- O nome quebrado em linhas do Leg Press 45º com pés e joelhos juntos, na semana 3,
  foi recomposto e conferido na tabela.
- Variações genéricas e específicas de equipamento/ângulo continuam distintas;
  por exemplo, Supino Inclinado com Halteres não presume o ângulo de 30º ou 45º.

Os 35 novos cadastros têm grupo principal e busca no YouTube, sem substituições
inventadas. A base pública de anatomia citada acima foi consultada para os movimentos:
Smith Machine Bench Press → peito; Cable Crunch/Decline Crunch/Flat Bench Lying Leg
Raise → abdômen; High Cable Curls → bíceps; Cable Shrugs → trapézio;
Hyperextensions → lombar; Sumo Deadlift → posterior de coxa. O cardio tem grupo Cardio
e fica separado da contagem de séries musculares. A classificação genérica de
Remada Unilateral foi corrigida de Lateral de Ombro para Costas, conferida em
One-Arm Dumbbell Row e aplicada ao modelo Boost também. Cópias de execuções já
iniciadas não são alteradas por essa correção.
