# Programas padrão com variação semanal

Cada JSON declara `id`, nome, autor, duração de 1 a 12 semanas e `weeks`.
Cada semana tem dias (`weekday`: domingo=0), título e lista ordenada de exercícios.
Cada ocorrência tem identificador próprio, inclusive quando o nome se repete.
As prescrições têm `series`, `reps` em texto, `restSeconds` (zero é válido),
`technique` e, quando aplicável, `groupId` e `groupType` (Bi-set/Tri-set).
Dias ausentes são descanso. O registro do catálogo é localizado pelo nome canônico.

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

O catálogo passou de 94 para 153 exercícios. Correspondências sem ambiguidade
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
