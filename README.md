<div align="center">

# 🔗 ContaVinculada

**Sistema de gestão de lançamentos financeiros e contracheques para empresas.**  
Migração moderna do sistema legado PHP para Nuxt 4 + Vue 3 + SQL Server.

![Nuxt](https://img.shields.io/badge/Nuxt-4.x-00DC82?style=for-the-badge&logo=nuxt.js&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-MSSQL-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)

</div>

---

## 📋 Sobre o Projeto

O **ContaVinculada** é um sistema interno corporativo que centraliza operações financeiras vinculadas a projetos e funcionários. Originalmente desenvolvido em PHP, foi migrado para uma stack moderna com:

- **Frontend SPA** em Vue 3 com Nuxt 4
- **Backend sem servidor externo** — as APIs são server routes do próprio Nuxt
- **Banco de dados** Microsoft SQL Server com stored procedures legadas preservadas
- **Interface responsiva** com dark mode, animações e design moderno

### Funcionalidades

| Módulo | Funcionalidade |
|---|---|
| 🏠 Dashboard | Cards de métricas reais (funcionários, contracheques, lançamentos) |
| 👥 Cadastro | CRUD de Funcionários com vínculo a projetos |
| 💸 Lançamento Manual | Lançamentos em lote por projeto ou funcionários específicos |
| 🔄 Lançamento Reembolso | Controle de reembolsos com datas e ofícios |
| 📄 Contracheque | Importação e aprovação/reprovação em massa |
| 📊 Extrato | Extrato de movimentações por funcionário e por projeto |
| ⚙️ Configuração | Gestão de usuários do sistema |

---

## 🛠️ Stack Tecnológica

```
Frontend         → Vue 3 + Nuxt 4 (SSR/SPA)
Estilo           → Tailwind CSS v4 via PostCSS
Dark Mode        → @nuxtjs/color-mode (classe 'dark' no <html>)
Ícones           → @nuxt/icon (FontAwesome 7: fa7-solid:*)
Máscaras         → maska v3 (diretiva v-maska via plugin)
Animações        → @vueuse/motion (v-motion) + CSS Transitions
Banco de Dados   → Microsoft SQL Server (mssql driver)
Gerenciador      → pnpm
```

---

## ⚡ Pré-requisitos

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **SQL Server** (local ou remoto) com a database do sistema configurada

---

## 🚀 Como Rodar

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd contaVinculadaV2
```

### 2. Instale as dependências
```bash
pnpm install
```

### 3. Configure o ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com as credenciais do banco:

```env
DB_SERVER=localhost        # IP ou hostname do SQL Server
DB_USER=sa                 # Usuário SQL
DB_PASS=SuaSenhaForte      # Senha SQL
DB_NAME=NomeDoBanco        # Nome da database
DB_PORT=1433               # Porta (padrão: 1433)
API_BASE_URL=http://localhost:3000/api
```

### 4. Inicie o servidor de desenvolvimento
```bash
pnpm dev
```

A aplicação estará disponível em **http://localhost:3000**

### 5. Build para produção
```bash
pnpm build
pnpm start
```

---

## 📁 Estrutura do Projeto

```
contaVinculadaV2/
│
├── app/                          ← Código da aplicação (srcDir)
│   ├── assets/css/tailwind.css   ← Estilos globais + transições de página
│   ├── components/               ← Componentes Vue (auto-importados)
│   │   ├── AppNavbar.vue         ← Barra superior com relógio em tempo real
│   │   ├── AppSidebar.vue        ← Menu lateral com navegação
│   │   ├── AppModal.vue          ← Modal reutilizável com #footer slot
│   │   └── FundoParticulas.vue   ← Canvas de partículas interativas (login)
│   ├── composables/
│   │   └── useTheme.ts           ← isDark, toggleTheme
│   ├── layouts/
│   │   └── default.vue           ← Layout principal (Navbar + Sidebar + <slot>)
│   ├── pages/                    ← Rotas automáticas
│   │   ├── login.vue             ← Sem layout, com v-motion + partículas
│   │   ├── index.vue             ← Dashboard com cards reais
│   │   ├── cadastro/funcionario/ ← index (listagem) + detalhe (form)
│   │   ├── operacao/
│   │   │   ├── lancamento/manual/     ← index + cadastro
│   │   │   ├── lancamento/reembolso/  ← index + cadastro
│   │   │   ├── extrato/               ← funcionario + projeto
│   │   │   └── contracheque/processamento/
│   │   └── configuracao/usuario/
│   └── plugins/
│       └── maska.ts              ← Registro global da diretiva v-maska
│
├── server/                       ← Backend (server-only, não exposto ao cliente)
│   ├── utils/
│   │   └── db.ts                 ← Pool singleton de conexão com SQL Server
│   └── api/                      ← Endpoints REST (auto-descobertos pelo Nuxt)
│       ├── dashboard/stats.get.ts
│       ├── cadastro/funcionario/ ← filtro, grava, recupera, excluir, autocomplete
│       ├── cadastro/projeto/
│       ├── configuracao/usuario/
│       ├── operacao/lancamento/manual/
│       ├── operacao/lancamento/reembolso/
│       ├── operacao/contracheque/
│       └── tabelaBasica/
│
├── .env                          ← ⚠️ NÃO commitar — credenciais locais
├── .env.example                  ← Template para novos devs
├── nuxt.config.ts                ← Configuração principal
├── tailwind.config.ts            ← darkMode: 'class', content paths
└── DOCUMENTACAO_TECNICA.md       ← Guia completo para desenvolvedores
```

---

## 🔌 API — Padrão dos Endpoints

Todas as rotas seguem a mesma estrutura. **Não há controller externo** — cada arquivo `.ts` dentro de `server/api/` é uma rota descoberta automaticamente pelo Nuxt.

### Convenção de nomenclatura

| Arquivo | Método | Rota |
|---|---|---|
| `filtro.post.ts` | POST | `/api/.../filtro` |
| `recupera.get.ts` | GET | `/api/.../recupera?codigo=X` |
| `grava.post.ts` | POST | `/api/.../grava` |
| `excluir.post.ts` | POST | `/api/.../excluir` |
| `listagem.post.ts` | POST | `/api/.../listagem` |

### Contrato de resposta

```ts
// Sucesso — listagem
{ status: 'success', results: [...] }

// Sucesso — item único
{ status: 'success', data: {...} }

// Sucesso — escrita
{ status: 'success', mensagem: 'Operação realizada.' }

// Erro
{ status: 'failed', mensagem: 'Descrição do erro.' }
```

### Exemplo de endpoint completo

```ts
// server/api/cadastro/funcionario/filtro.post.ts
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    try {
        const request = db.request()
        request.input('nome', `%${body.nome}%`)

        const result = await request.query(`
            SELECT codigo, nomeCompleto FROM cadastro.Funcionario
            WHERE nomeCompleto LIKE @nome
        `)

        return { status: 'success', results: result.recordset }

    } catch (error: any) {
        return { status: 'failed', mensagem: 'Erro: ' + error.message }
    }
})
```

### Consumo no frontend

```ts
// Em qualquer .vue (composable $fetch do Nuxt)
const data = await $fetch('/api/cadastro/funcionario/filtro', {
    method: 'POST',
    body: { nome: 'João' }
})

if (data.status === 'success') {
    items.value = data.results
}
```

---

## 🗄️ Banco de Dados — Schemas

O SQL Server está organizado nos schemas:

| Schema | Tabelas principais |
|---|---|
| `cadastro` | `Funcionario`, `projeto`, `projetoContaVinculada` |
| `operacao` | `lancamentoManual`, `lancamentoReembolso`, `baseContracheque` |
| `configuracao` | `usuario`, `usuarioProjeto` |
| `tabelaBasica` | `tipoMovimentacao`, `banco`, `status` |

As operações de **INSERT/UPDATE** são feitas via **stored procedures** que recebem um XML de vínculos:

```xml
<ArrayOfFuncionario>
  <funcionario>
    <codigo>0</codigo>
    <funcionario>42</funcionario>
    <tipoAlteracao>1</tipoAlteracao>  <!-- 1=inserir, 2=excluir -->
  </funcionario>
</ArrayOfFuncionario>
```

---

## 🎨 UI & Dark Mode

O tema é controlado pelo composable `useTheme()`:

```ts
const { isDark, toggleTheme } = useTheme()
```

- A classe `dark` é aplicada ao `<html>` pelo `@nuxtjs/color-mode`
- Todos os componentes usam classes Tailwind duais: `bg-white dark:bg-gray-800`
- A preferência é persistida em `localStorage` via chave `nuxt-color-mode`

---

## ✨ Animações

| Animação | Onde | Como |
|---|---|---|
| **Partículas interativas** | Tela de login (fundo) | `FundoParticulas.vue` (canvas nativo, repulsão ao mouse) |
| **Card de login** | Entrada da tela login | `v-motion` spring (`y:50→0, scale:0.9→1`) |
| **Navegação entre páginas** | Todas as páginas | CSS Transition `fade-left` (desliza da esquerda, 220ms) |
| **Troca de ícone de tema** | Botão sol/lua | CSS Transition com rotação 90° |
| **Mensagem de erro** | Formulários | `v-motion` slide da esquerda |

---

## 📝 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `DB_SERVER` | Host do SQL Server | `localhost` |
| `DB_USER` | Usuário do banco | `sa` |
| `DB_PASS` | Senha do banco | — |
| `DB_NAME` | Nome da database | — |
| `DB_PORT` | Porta do SQL Server | `1433` |
| `API_BASE_URL` | URL base da API | `http://localhost:3000/api` |

> Variáveis sem prefixo `NUXT_PUBLIC_` ficam disponíveis **somente no servidor**, nunca expostas ao cliente.

---

## ⚠️ Limitações Conhecidas

- **Autenticação**: provisoriamente o `usuarioId` é fixo (= 1) em endpoints de gravação. Auth completa pendente.
- **Senha**: armazenada sem hash. Implementar bcrypt antes de ir para produção.
- **Extrato**: UI pronta para funcionário e projeto, mas backend não implementado.

---

## 📄 Documentação Adicional

Consulte [`DOCUMENTACAO_TECNICA.md`](./DOCUMENTACAO_TECNICA.md) para:
- Guia detalhado de como criar novos endpoints
- Mapa completo de todas as tabelas e procedures
- Checklist de pendências técnicas

---

<div align="center">

Desenvolvido com ❤️ — Migração PHP → Nuxt 4

</div>
