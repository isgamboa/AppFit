# AppFit — Treino

Aplicativo de treino, dieta e acompanhamento corporal em HTML, CSS e JavaScript.
Funciona localmente e offline, sem cadastro obrigatório e sem etapa de build.

Este é o fork [isgamboa/AppFit](https://github.com/isgamboa/AppFit), baseado em
[DUK22/AppFit](https://github.com/DUK22/AppFit). As personalizações desta versão
são mantidas neste fork; o projeto original permanece independente.

## Novidades da versão 1.1.0

### Meus programas

- Criação de vários programas personalizados, com um programa ativo por vez.
- Modelos iniciais **ABC — três dias** e **Full-body — três dias**.
- Escolha dos três dias da semana e edição dos nomes das sessões A, B e C.
- Inclusão de exercícios do banco, remoção e reordenação.
- Edição de nome, grupo muscular, séries, repetições e observações dos exercícios.
- Duplicação, edição, exclusão e ativação de programas salvos.
- Inclusão dos programas personalizados no backup JSON e na sincronização Firebase opcional.
- Identificadores estáveis para exercícios personalizados e cópia da sessão nos registros,
  para preservar o histórico após alterações ou exclusão do programa.

### Correções da montagem de treino

- A seleção ABC/full-body é aplicada diretamente, sem depender de uma confirmação nativa.
  A troca redefine os exercícios, preservando o nome do programa e os dias escolhidos.
- Ao escolher um dia ocupado por outra sessão, as duas sessões trocam de dia.
- A introdução automática não substitui uma janela que já esteja aberta.
- Atualização da versão do cache da PWA para distribuir a versão nova quando hospedada.

## Como usar

### Arquivo local

Baixe o [index.html](index.html) e abra no navegador. Não é necessário instalar
as dependências de desenvolvimento para usar o aplicativo. Os dados são salvos
no navegador; mantenha backups antes de trocar de navegador, dispositivo ou endereço.

### Criar seu programa

1. Na aba **Hoje**, toque em **trocar treino → Criar meu treino**.
2. Escolha ABC ou full-body e os três dias da semana.
3. Navegue pelos botões **A**, **B** e **C** para montar cada sessão.
4. Adicione exercícios do banco e ajuste séries, repetições e observações.
5. Toque em **Salvar programa** e depois em **Usar este programa**.

Na tela de programas, use **Editar**, **Duplicar** ou **Excluir** para gerenciar
seus treinos. Salvar um programa novo não o ativa automaticamente.

### Instalação como PWA

Hospede os arquivos do aplicativo em HTTPS, por exemplo no GitHub Pages, ou use
localhost para desenvolvimento. Abra o endereço no navegador e use a opção
**Instalar aplicativo** ou **Adicionar à tela de início**, quando disponível.

A publicação deve incluir `index.html`, `sw.js`, `manifest.webmanifest`,
`icon-192.png`, `icon-512.png` e `apple-touch-icon.png`. A instalação da PWA exige
um endereço servido; abrir somente o HTML local não registra o service worker.

## Recursos originais mantidos

- Programas ABCDE + Full Body (Laércio Refundini), Saitama, Ramon Dino, Arnold e CBum.
- Abas Hoje e Semana, marcação de exercícios, progresso diário e duração da sessão.
- Alternância C1/C2 e D1/D2 no programa original, com ajuste manual do ciclo.
- Registro de carga e repetições por série, sugestão da última sessão e de aumento de carga.
- Estimativa de 1RM, recordes pessoais, gráficos de evolução e adesão semanal.
- Banco de exercícios, substituição, edição e buscas de execução no YouTube.
- Cronômetro de descanso, som e vibração quando suportados pelo dispositivo.
- Calculadoras de 1RM e anilhas, aquecimento e rotinas de alongamento.
- Dieta: refeições, alimentos, metas nutricionais e registro de água.
- Corpo: peso, medidas, fotos de progresso e gráficos.
- Registro de atividades físicas com estimativas de gasto energético.
- Exportação/importação de backup JSON e sincronização Firebase opcional.

## Dados, backup e sincronização

O uso local não exige conta. O estado do aplicativo é salvo em `localStorage`.
Em **⚙️ Ajustes**, exporte um backup JSON e importe no outro dispositivo quando
quiser transferir os dados, incluindo seus programas personalizados.

Para sincronização automática, siga [CONFIGURAR-SYNC.md](CONFIGURAR-SYNC.md).
Quando ativada, a sincronização envia dados ao projeto Firebase configurado;
as fotos permanecem no aparelho e podem ser transferidas por backup. O carregamento
do Firebase e a sincronização exigem internet, assim como os links do YouTube.

Os novos registros guardam uma cópia da sessão para manter a interpretação do
histórico após mudanças no programa. O aplicativo antigo não registrava o programa
ativo em cada data: registros anteriores sem essa informação são preservados com
base no programa selecionado antes da primeira alteração. Não é possível reconstruir
automaticamente trocas antigas que nunca foram registradas.

## Desenvolvimento e testes

Use Node.js compatível com o lockfile (validado com Node.js 24) e Python 3:

```sh
npm ci
python3 -m http.server 8000 --bind 127.0.0.1
```

Não há build. O aplicativo não usa JSDOM em produção; essa dependência é usada nos testes.

Em outro terminal, na raiz do projeto:

```sh
node tests/custom-programs.mjs
```

A suíte contém **170 verificações** de criação, validação, seleções, ativação,
duplicação, reordenação, exclusão, histórico, persistência, escape de nomes,
payload de sincronização, restauração remota e navegação. Canvas e áudio são simulados.
O comando `npm test` herdado do projeto é um placeholder; use o comando acima.

Nesta versão também passaram 27 verificações de regressão do teste legado,
executado em cópia adaptada ao nome `index.html`, às seis abas atuais e ao descanso
automático opcional, além de 236 verificações no Chromium em telas de computador
e celular. O teste de navegador foi executado durante o desenvolvimento e não
integra a suíte versionada. Essas verificações não validam sincronização com um
Firebase real nem instalação e funcionamento offline completo da PWA.

## Estrutura

```text
index.html              Aplicativo e lógica principal
sw.js                   Cache para uso offline quando hospedado
manifest.webmanifest    Metadados de instalação da PWA
icon-*.png              Ícones do aplicativo
apple-touch-icon.png    Ícone para dispositivos Apple
CONFIGURAR-SYNC.md       Configuração opcional do Firebase
package*.json           Dependências de desenvolvimento e lockfile
tests/                  Testes dos programas personalizados
_*.js / _*.mjs          Verificações e arquivos auxiliares herdados
```

## Autoria e licença

Baseado no trabalho de [DUK22/AppFit](https://github.com/DUK22/AppFit), com
personalizações mantidas por [isgamboa](https://github.com/isgamboa).

O README original declara “Livre para uso pessoal” e sugere
[MIT](https://choosealicense.com/licenses/mit/), enquanto o `package.json` declara
ISC. Não há arquivo `LICENSE` neste checkout. Esta versão preserva essas informações
sem declarar uma nova licença para o código original.
