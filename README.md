# 🏦 ImboliBank

App de banco virtual para jogos de tabuleiro estilo Banco Imobiliário — chega de dinheiro de papel! Cada jogador usa seu próprio celular, conectado à mesma sala, com saldo e transações sincronizados em tempo real entre todos os dispositivos.

## Funcionalidades

- **Criar sala** — inicie um novo jogo e receba um código curto para compartilhar
- **Entrar com código** — outros jogadores entram na mesma sala pelo celular deles
- **Transferências entre jogadores** — pague outro jogador diretamente
- **Impostos, aluguéis e compras** — transações com o banco (taxas, aluguel de propriedades, compra de imóveis)
- **Histórico de transações** — veja tudo que já aconteceu na partida
- **Sincronização em tempo real** — qualquer transação aparece instantaneamente em todos os celulares conectados à sala

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://github.com/pmndrs/zustand) — gerenciamento de estado
- [Supabase](https://supabase.com/) — banco de dados Postgres + sincronização em tempo real (Realtime)

## Como rodar localmente

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) instalado
- [pnpm](https://pnpm.io/) instalado (`npm install -g pnpm`)
- Uma conta no [Supabase](https://supabase.com/) com um projeto criado

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha com os dados do seu projeto Supabase (em **Project Settings → API**):

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-public-aqui
```

> ⚠️ O `.env.local` nunca deve ser commitado — ele já está protegido pelo `.gitignore` (regra `*.local`).

### 4. Crie as tabelas no Supabase

No **SQL Editor** do seu projeto Supabase, rode o script `setup-supabase.sql` (na raiz do repositório). Ele cria as tabelas `games`, `players` e `transactions`, habilita o Realtime nelas, e configura as políticas de acesso.

### 5. Rode o projeto

```bash
pnpm dev
```

Abra o endereço `Local` (ex: `http://localhost:8080`) no seu navegador. Para testar em outro dispositivo (como o celular) na mesma rede Wi-Fi, use o endereço `Network` que aparece no terminal.

## Estrutura do projeto

```
src/
├── components/   # Componentes reutilizáveis (UI, avatares, transações)
├── hooks/        # Hooks customizados
├── lib/          # Cliente Supabase, gerador de código de sala, utilitários
├── pages/        # Telas do app (Home, Setup, Transfer, Players, History...)
├── store/        # Estado global (Zustand + Supabase)
└── types/        # Tipos TypeScript compartilhados
```

## Publicando

O projeto já está configurado para deploy na [Vercel](https://vercel.com/) (`vercel.json`). Lembre-se de configurar as mesmas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações de ambiente do projeto na Vercel.