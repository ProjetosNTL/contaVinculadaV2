<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Tabela de" tituloGrosso="Bancos"
      descricao="Cadastro e gestão de instituições financeiras" icone="fa7-solid:building-columns" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual" mostrar-relatorio @excel="gerarExcel" @pdf="gerarPdf">
      <template #entradas>
        <AppInputTexto v-model="filtro.descricao" placeholder="Buscar por nome do banco..." icone="fa7-solid:magnifying-glass"
          @enter="buscarLista" />
        <AppSelecaoStatus v-model="filtro.ativo" />
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:download" @click="navigateTo('/tabelaBasica/bancos/importar')">
          Importação
        </AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="acao" icone="fa7-solid:plus" @click="navigateTo('/tabelaBasica/bancos/cadastro')">
          Novo Banco
        </AppBotao>
      </template>

      <template #acoes-pesquisa>
        <AppBotao variacao="acao" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Pesquisar Bancos
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
      :visaoAtual="visaoAtual" @mudarPagina="mudarPagina">

      <template #cabecalho-tabela>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Código</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Banco</th>
        <th scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Status</th>
        <th scope="col"
          class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
          Histórico</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4">
          <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ item.codigoBanco }}</span>
        </td>
        <td class="px-6 py-4">
          <NuxtLink :to="`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`" class="flex items-center gap-3 group">
            <span
              class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {{ item.descricao }}
            </span>
          </NuxtLink>
        </td>
        <td class="px-6 py-4 text-center">
          <AppAtivo :ativo="item.ativo" />
        </td>
        <td class="px-6 py-4 text-center">
          <button @click.stop="abrirHistorico(item.codigo)"
            class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
            title="Ver Histórico">
            <Icon name="fa6-solid:clock-rotate-left" class="w-5 h-5" />
          </button>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.descricao" :subtituloNome="'Cód. Banco'" :subtituloValor="item.codigoBanco"
          :ativo="item.ativo" :mostrarStatus="true" :mostrarHistorico="true"
          @ver-detalhes="navigateTo(`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`)"
          @ver-historico="abrirHistorico(item.codigo)"
          @clique-titulo="navigateTo(`/tabelaBasica/bancos/cadastro?codigo=${item.codigo}`)" />
      </template>

    </AppContainerListagem>

    <AppModalHistorico :aberto="modalHistoricoAberto" :historico="historicoSelecionado"
      :carregando="carregandoHistorico" @close="modalHistoricoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const visaoAtual = ref('lista')
const buscaRealizada = ref(true)
const carregando = ref(false)
const dados = ref<any[]>([])
const filtro = ref({ descricao: '', ativo: 1 })

const modalHistoricoAberto = ref(false)
const historicoSelecionado = ref<any[]>([])
const carregandoHistorico = ref(false)

const mudarPagina = (p: number) => { }
const buscarLista = () => { }
const abrirHistorico = (id: number) => {
  modalHistoricoAberto.value = true
}

const gerarExcel = () => {
    alert('📊 Gerando relatório Excel de Bancos...')
}

const gerarPdf = () => {
    alert('📄 Gerando PDF da Tabela de Bancos...')
}
</script>