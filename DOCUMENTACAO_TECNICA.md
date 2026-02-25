# 📘 Documentação Técnica — ContaVinculada (Nuxt 4)

> Guia de referência para desenvolvedores. Cobre: estrutura do projeto, banco de dados, padrões de API, ambiente, frontend e convenções adotadas.

---

## 1. Stack Tecnológica

| Camada | Tecnologia | Versão aprox. |
|---|---|---|
| Framework | Nuxt 4 (modo `srcDir: 'app/'`) | 4.x |
| UI | Vue 3 + Tailwind CSS v4 (via PostCSS) | 3.x / 4.x |
| Dark Mode | `@nuxtjs/color-mode` (classe `dark` no `<html>`) | — |
| Ícones | `@nuxt/icon` (prefixo `fa7-solid:`) | — |
| Máscaras | `maska` v3 (diretiva `v-maska`, plugin registrado) | 3.x |
| Banco de Dados | Microsoft SQL Server (MSSQL) | — |
| Driver Node | `mssql` npm package | — |
| Gerenciador de pacotes | `pnpm` | — |

---

## 2. Estrutura de Pastas

```
contaVinculadaNuxt4/
├── app/                        ← srcDir (todo o código Vue/Nuxt fica aqui)
│   ├── assets/css/tailwind.css ← @tailwind base/components/utilities
│   ├── components/             ← Componentes globais registrados automaticamente
│   │   ├── AppNavbar.vue       ← Barra superior (relógio, usuário, logout)
│   │   ├── AppSidebar.vue      ← Menu lateral com navegação
│   │   └── AppModal.vue        ← Modal reutilizável com slot #footer
│   ├── composables/
│   │   └── useTheme.ts         ← isDark / toggleTheme via useColorMode()
│   ├── layouts/
│   │   └── default.vue         ← Layout principal (Navbar + Sidebar + Slot)
│   ├── pages/                  ← Rotas automáticas pelo Nuxt
│   │   ├── login.vue           ← layout: false (sem sidebar)
│   │   ├── index.vue           ← Dashboard com cards reais
│   │   ├── cadastro/
│   │   │   └── funcionario/
│   │   │       ├── index.vue   ← Listagem com filtros
│   │   │       └── detalhe.vue ← Formulário criar/editar
│   │   ├── operacao/
│   │   │   ├── lancamento/
│   │   │   │   ├── manual/
│   │   │   │   │   ├── index.vue    ← Listagem
│   │   │   │   │   └── cadastro.vue ← Formulário
│   │   │   │   └── reembolso/
│   │   │   │       ├── index.vue    ← Listagem
│   │   │   │       └── cadastro.vue ← Formulário
│   │   │   ├── extrato/
│   │   │   │   ├── funcionario.vue
│   │   │   │   └── projeto.vue
│   │   │   └── contracheque/
│   │   │       └── processamento/
│   │   │           └── index.vue
│   │   └── configuracao/
│   │       └── usuario/
│   │           ├── index.vue
│   │           └── detalhe.vue
│   └── plugins/
│       └── maska.ts            ← Registra v-maska globalmente (necessário no maska v3)
│
├── server/                     ← Backend Nuxt (server-side only)
│   ├── utils/
│   │   └── db.ts               ← ÚNICO ponto de conexão com o banco (pool singleton)
│   └── api/                    ← Endpoints REST automáticos pelo Nuxt
│       ├── dashboard/
│       │   └── stats.get.ts
│       ├── cadastro/
│       │   ├── funcionario/    ← filtro, grava, recupera, excluir, autocomplete
│       │   └── projeto/        ← ativos
│       ├── configuracao/
│       │   └── usuario/        ← filtro, grava, recupera, excluir
│       ├── operacao/
│       │   ├── lancamento/
│       │   │   ├── manual/     ← listagem, grava, contas, recuperaFuncionario
│       │   │   └── reembolso/  ← listagem, grava, recuperaFuncionario
│       │   └── contracheque/
│       │       ├── importacao/ ← processar
│       │       └── processamento/ ← filtro, processar
│       └── tabelaBasica/
│           └── tipoMovimentacao/ ← recupera
│
├── nuxt.config.ts              ← Configuração central
├── tailwind.config.ts          ← darkMode: 'class', content paths
├── .env                        ← Variáveis de ambiente (NÃO comitar)
└── .env.example                ← Template das variáveis necessárias
```

---

## 3. Configuração do Ambiente (`.env`)

Copie `.env.example` para `.env` e preencha:

```env
DB_SERVER=localhost          # IP ou hostname do SQL Server
DB_USER=sa                   # Usuário do banco
DB_PASS=SuaSenhaForte        # Senha do banco
DB_NAME=NomeDoBanco          # Nome da database
DB_PORT=2866                 # Porta (padrão MSSQL = 2866)
```

Essas variáveis são lidas em `nuxt.config.ts` via `runtimeConfig` e ficam disponíveis **somente no lado servidor** (exceto `public.apiBase`):

```ts
// nuxt.config.ts
runtimeConfig: {
  dbServer: process.env.DB_SERVER,
  dbUser:   process.env.DB_USER,
  dbPass:   process.env.DB_PASS,
  dbName:   process.env.DB_NAME,
  dbPort:   process.env.DB_PORT,
  public: {
    apiBase: process.env.API_BASE_URL || ''
  }
}
```

---

## 4. Conexão com o Banco — `server/utils/db.ts`

**Este é o único arquivo que deve ser alterado se as credenciais ou configurações do banco mudarem.**

```ts
import sql from 'mssql'
import { useRuntimeConfig } from '#imports'

let pool: sql.ConnectionPool | null = null

export const useDb = async () => {
    const config = useRuntimeConfig()

    // Reutiliza a conexão se já estiver ativa (pool singleton)
    if (pool && pool.connected) return pool

    pool = new sql.ConnectionPool({
        server:   config.dbServer,
        user:     config.dbUser,
        password: config.dbPass,
        database: config.dbName,
        port:     Number(config.dbPort) || 1433,
        options: {
            encrypt: false,              // true em ambientes Azure
            trustServerCertificate: true,// false em produção com cert assinado
            enableArithAbort: true
        },
        pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
    })

    await pool.connect()
    return pool
}
```

**Como usar em qualquer endpoint:**
```ts
import { useDb } from '../../utils/db'  // ajuste o caminho relativo

const db = await useDb()
const request = db.request()
```

> ⚠️ O import é sempre relativo ao arquivo. Os níveis de `../../` variam por profundidade de pasta.

---

## 5. Padrão de Endpoints da API

### Nomenclatura de arquivos

O Nuxt auto-descobre rotas pelo nome do arquivo:

| Nome do arquivo | Método HTTP | Rota gerada |
|---|---|---|
| `filtro.post.ts` | POST | `/api/.../filtro` |
| `recupera.get.ts` | GET | `/api/.../recupera` |
| `grava.post.ts` | POST | `/api/.../grava` |
| `excluir.post.ts` | POST | `/api/.../excluir` |
| `listagem.post.ts` | POST | `/api/.../listagem` |
| `stats.get.ts` | GET | `/api/dashboard/stats` |

### Estrutura padrão de um endpoint

Todo endpoint segue exatamente este padrão:

```ts
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)      // para POST
    // const query = getQuery(event)        // para GET com query params
    const db = await useDb()

    try {
        const request = db.request()

        // 1. Adicionar parâmetros com tipo (evita SQL Injection)
        request.input('nomeParam', valor)

        // 2. Executar query direta ou stored procedure
        const result = await request.query(`SELECT ...`)
        // ou: await request.query(`EXEC schema.procedure_Atualiza @param = @param`)

        // 3. Retornar no padrão unificado
        return {
            status: 'success',
            results: result.recordset      // listagens
            // data: result.recordset[0]   // registro único
            // mensagem: 'Texto'           // operações de escrita
        }

    } catch (error: any) {
        console.error('Erro em [nome do endpoint]:', error)
        return { status: 'failed', mensagem: 'Erro: ' + error.message }
    }
})
```

### Padrão de resposta (contrato da API)

| Situação | Estrutura retornada |
|---|---|
| Listagem com resultados | `{ status: 'success', results: [...] }` |
| Registro único | `{ status: 'success', data: {...} }` |
| Gravação/exclusão OK | `{ status: 'success', mensagem: 'Operação realizada.' }` |
| Erro de validação | `{ status: 'failed', mensagem: 'Motivo do erro.' }` |
| Erro de banco | `{ status: 'failed', mensagem: 'Erro: ' + error.message }` |

> ⚠️ **Inconsistência conocida:** Alguns endpoints `filtro.post.ts` antigos lançam `throw createError({ statusCode: 500 })` em vez de retornar `{ status: 'failed' }`. O padrão correto é sempre **`return { status: 'failed' }`**, pois o frontend verifica `data.status`.

---

## 6. Stored Procedures e Esquemas do Banco

O banco está organizado em **schemas SQL**:

| Schema | Propósito |
|---|---|
| `cadastro` | Funcionário, Projeto, ContaVinculada |
| `operacao` | LançamentoManual, LançamentoReembolso, BaseContracheque |
| `configuracao` | Usuario, UsuarioProjeto |
| `tabelaBasica` | TipoMovimentação, Banco, Status |

### Tabelas principais consultadas

| Tabela completa | Uso |
|---|---|
| `cadastro.Funcionario` | CRUD de funcionários |
| `cadastro.projeto` | Lista de projetos ativos |
| `cadastro.projetoContaVinculada` | Contas bancárias por projeto |
| `operacao.lancamentoManual` | Lançamentos em lote |
| `operacao.lancamentoManualFuncionario` | Vínculo lançamento ↔ funcionário |
| `operacao.lancamentoReembolso` | Lançamentos de reembolso |
| `operacao.lancamentoReembolsoFuncionario` | Vínculo reembolso ↔ funcionário |
| `operacao.baseContracheque` | Contracheques importados |
| `configuracao.usuario` | Usuários do sistema |
| `configuracao.usuarioProjeto` | Projetos vinculados ao usuário |
| `tabelaBasica.tipoMovimentacao` | Tipos de movimentação |
| `tabelaBasica.banco` | Cadastro de bancos |
| `tabelaBasica.status` | Status de reembolso |

### Stored Procedures utilizadas

| Procedure | Operação |
|---|---|
| `cadastro.Funcionario_Atualiza` | INSERT/UPDATE de funcionário |
| `configuracao.usuario_atualiza` | INSERT/UPDATE de usuário |
| `operacao.lancamentoManual_Atualiza` | INSERT/UPDATE de lançamento manual |
| `operacao.lancamentoReembolso_Atualiza` | INSERT/UPDATE de reembolso |

As procedures recebem um parâmetro `@xmlFuncionario` ou `@xmlProjeto` no formato:

```xml
<ArrayOfFuncionario>
  <funcionario>
    <codigo>0</codigo>
    <funcionario>42</funcionario>
    <tipoAlteracao>1</tipoAlteracao>
  </funcionario>
</ArrayOfFuncionario>
```

> `tipoAlteracao`: `1` = inserir, `2` = excluir.

---

## 7. Como Criar um Novo Endpoint

### Passo a passo

**1. Crie o arquivo no caminho correto:**
```
server/api/{modulo}/{submodulo}/{acao}.{method}.ts
```

**2. Copie o template padrão:**
```ts
import { useDb } from '../../../utils/db'  // ajuste os ../

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    try {
        const request = db.request()
        request.input('campo', body.campo)

        const result = await request.query(`
            SELECT * FROM schema.Tabela WHERE campo = @campo
        `)

        return { status: 'success', results: result.recordset }

    } catch (error: any) {
        console.error('Erro em [nome]:', error)
        return { status: 'failed', mensagem: 'Erro: ' + error.message }
    }
})
```

**3. O Nuxt registra a rota automaticamente** — não precisa registrar em nenhum outro lugar.

**4. No frontend, consuma com `$fetch`:**
```ts
const data = await $fetch('/api/modulo/submodulo/acao', {
    method: 'POST',
    body: { campo: valor }
})
if (data.status === 'success') { /* ... */ }
```

---

## 8. Diretiva `v-maska` (Máscaras de Input)

O pacote `maska` v3 **não registra a diretiva globalmente** de forma automática. Por isso existe o plugin:

```ts
// app/plugins/maska.ts
import { vMaska } from 'maska/vue'
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('maska', vMaska)
})
```

**Uso nos templates:**
```html
<!-- CPF -->
<input v-maska data-maska="###.###.###-##" />

<!-- Data -->
<input v-maska data-maska="##/##/####" />

<!-- Mês/Ano -->
<input v-maska data-maska="##/####" />
```

---

## 9. Dark Mode

- Controlado por `@nuxtjs/color-mode`
- Aplica a classe `dark` no elemento `<html>`
- Configurado em `nuxt.config.ts`: `classSuffix: ''` (sem sufixo)
- Tailwind usa `darkMode: 'class'` em `tailwind.config.ts`
- Para alternar: `composables/useTheme.ts` → `toggleTheme()`

**Padrão de classes a seguir sempre:**
```html
class="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
```

---

## 10. Rodar o Projeto

```bash
# Instalar dependências
pnpm install

# Copiar e configurar o ambiente
cp .env.example .env
# Editar .env com as credenciais do banco

# Rodar em desenvolvimento (porta 3000 em todas as interfaces)
pnpm dev

# Build para produção
pnpm build
pnpm start
```

---

## 11. Pendências e Melhorias Conhecidas

| # | Item | Status |
|---|---|---|
| 1 | Autenticação real (JWT ou sessão server-side) | ⚠️ Pendente — atualmente `usuarioId = 1` fixo em alguns endpoints de gravação |
| 2 | Hash de senha (MD5/bcrypt) no cadastro de usuário | ⚠️ Pendente — senha salva em plain text |
| 3 | Padronizar erros de filtro (alguns lançam HTTP 500, o padrão é `return { status: 'failed' }`) | ⚠️ Inconsistência menor |
| 4 | Extrato bancário (funcionário e projeto) | 🔲 API backend não implementada |
| 5 | Importação de contracheque UI completa | 🔲 Página parcial |
