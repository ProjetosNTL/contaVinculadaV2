<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Tabela de" tituloGrosso="Classificações"
      descricao="Gerenciamento de tipos de classificação de lançamentos" icone="fa7-solid:tags" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual">
      <template #entradas>
        <AppInputTexto v-model="filtro.descricao" placeholder="Buscar classificação..." icone="fa7-solid:magnifying-glass"
          @enter="buscarLista" />
        <AppSelecaoStatus v-model="filtro.ativo" />
      </template>

      <template #acoes-principais>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/tabelaBasica/classificacao/cadastro')">
          Nova Classificação
        </AppBotao>
      </template>

      <template #acoes-pesquisa>
        <AppBotao variacao="acao" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Pesquisar Classificações
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
      :visaoAtual="visaoAtual" @mudarPagina="mudarPagina">

      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Código</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Classificação</th>
        <th scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Status</th>
      </template>

      <template #linhas-tabela="{ item }">
         <td class="px-6 py-4 text-center">
          <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.codigo_classificacao }}</span>
        </td>
        <td class="px-6 py-4">
          <NuxtLink :to="`/tabelaBasica/classificacao/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
            <span
              class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {{ item.descricao }}
            </span>
          </NuxtLink>
        </td>
        <td class="px-6 py-4 text-center">
          <AppAtivo :ativo="item.ativo" />
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.descricao" :subtituloNome="'Cód'" :subtituloValor="item.codigo_classificacao"
          :ativo="item.ativo" :mostrarStatus="true"
          @ver-detalhes="navigateTo(`/tabelaBasica/classificacao/cadastro?codigo=${item.codigo}`)"
          @clique-titulo="navigateTo(`/tabelaBasica/classificacao/cadastro?codigo=${item.codigo}`)" />
      </template>

    </AppContainerListagem>

  </div>
</template>

<script setup lang="ts">
const visaoAtual = ref('lista')
const buscaRealizada = ref(true)
const carregando = ref(false)
const dados = ref<any[]>([])
const filtro = ref({ descricao: '', ativo: 1 })

const mudarPagina = (p: number) => { }
const buscarLista = () => { }
</script>