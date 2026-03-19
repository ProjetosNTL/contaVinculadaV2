<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Gestão de" tituloGrosso="Usuários"
      descricao="Gerenciamento de acessos e permissões do sistema" icone="fa7-solid:user-gear" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <AppInputTexto v-model="filtro.nome" placeholder="Buscar por usuário..." icone="fa7-solid:magnifying-glass"
          @enter="buscarLista" />
        <AppSelecaoStatus v-model="filtro.ativo" />
      </template>

      <template #acoes-principais>
        <AppBotao variacao="acao" icone="fa7-solid:user-plus" @click="navigateTo('/configuracao/usuario/cadastro')">
          Novo Usuário
        </AppBotao>
      </template>

      <template #acoes-pesquisa>
        <AppBotao variacao="acao" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Pesquisar Usuários
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
      :visaoAtual="visaoAtual" @mudarPagina="mudarPagina">

      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Usuário</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Login</th>
        <th scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Status</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4">
          <NuxtLink :to="`/configuracao/usuario/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
            <div
              class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-600 dark:text-blue-400 font-extrabold text-sm shrink-0">
              {{ item.nome.charAt(0).toUpperCase() }}
            </div>
            <span
              class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {{ item.nome }}
            </span>
          </NuxtLink>
        </td>
        <td class="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-400">
          {{ item.login }}
        </td>
        <td class="px-6 py-4 text-center">
          <AppAtivo :ativo="item.ativo" />
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.nome" :subtituloNome="'Login'" :subtituloValor="item.login" :ativo="item.ativo"
          :mostrarStatus="true" @ver-detalhes="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}`)"
          @clique-titulo="navigateTo(`/configuracao/usuario/cadastro?codigo=${item.codigo}`)" />
      </template>

    </AppContainerListagem>

  </div>
</template>

<script setup lang="ts">
const visaoAtual = ref('lista')
const buscaRealizada = ref(true)
const carregando = ref(false)
const dados = ref<any[]>([])
const filtro = ref({ nome: '', ativo: 1 })

const mudarPagina = (p: number) => { }
const buscarLista = () => { }
</script>
