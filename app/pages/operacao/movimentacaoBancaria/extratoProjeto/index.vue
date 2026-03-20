<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Extrato" tituloGrosso="Projeto"
      descricao="Visualize saldos e movimentações detalhadas por projeto" icone="fa7-solid:chart-pie" />

    <AppBarraFerramentas v-model:visao-atual="visaoAtual" mostrar-relatorio @excel="gerarExcel" @pdf="gerarPdf">
      <template #entradas>
        <AppInputAutocomplete 
          v-model="filtro.nomeParam" 
          :sugestoes="sugestoesNome" 
          :buscando="buscandoSugestoes"
          :mostrarMenu="mostrandoSugestoes" 
          :placeholder="placeholderDinamico"
          @buscar="buscarSugestoesNome" 
          @selecionar="selecionarSugestao" 
          @fechar="fecharSugestoesDelay"
          @enter="buscarLista" 
        />
      </template>

      <template #acoes-secundarias>
        <AppBotao variacao="padrao" icone="fa7-solid:table-columns" @click="abrirModalExibicao">Exibição</AppBotao>
        <AppBotao variacao="padrao" icone="fa7-solid:filter" @click="abrirModalFiltroAvancado">Filtros Avançados</AppBotao>
      </template>

      <template #acoes-principais>
        <AppBotao variacao="padrao" icone="fa7-solid:user-tag" @click="navigateTo('/operacao/movimentacaoBancaria/extratoFuncionario')">
          Ir para Extrato Funcionário
        </AppBotao>
      </template>

      <template #acoes-pesquisa>
        <AppBotao variacao="acao" icone="fa7-solid:magnifying-glass" @click="buscarLista">
          Atualizar Saldos
        </AppBotao>
      </template>
    </AppBarraFerramentas>

    <AppContainerListagem :carregando="carregando" :buscaRealizada="buscaRealizada" :lista="dados || []"
      :visaoAtual="visaoAtual" :registroInicial="registroInicial" :registroFinal="registroFinal"
      :totalRegistros="totalRegistros" :itensPorPagina="itensPorPagina" :totalPaginas="totalPaginas"
      :paginaAtual="paginaAtual" :paginasExibidas="paginasExibidas" @mudarPagina="mudarPagina"
      @mudarItensPorPagina="mudarItensPorPagina">

      <template #cabecalho-tabela>
        <th v-if="colunas.projeto" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Projeto</th>
        <th v-if="colunas.banco" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-60">Banco Principal</th>
        <th v-if="colunas.saldo" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-48">Saldo Consolidado</th>
        <th v-if="colunas.acoes" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-28">Extrato</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td v-if="colunas.projeto" class="px-6 py-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0">
              {{ item.apelido.charAt(0).toUpperCase() }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{ item.apelido }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.projeto }}</span>
            </div>
          </div>
        </td>
        <td v-if="colunas.banco" class="px-6 py-4 text-center w-60">
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.nomeBanco || 'Não vinculado' }}</span>
        </td>
        <td v-if="colunas.saldo" class="px-6 py-4 text-center font-black w-48" :class="Number(item.saldoProjeto) >= 0 ? 'text-emerald-600' : 'text-red-500'">
          R$ {{ formatarMoeda(item.saldoProjeto) }}
        </td>
        <td v-if="colunas.acoes" class="px-6 py-4 text-center w-28">
           <div class="flex items-center justify-center">
            <button @click.stop="abrirModalExtrato(item.codigoProjeto)"
              class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
              title="Ver Histórico Completo">
              <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5" />
            </button>
          </div>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.apelido" :subtituloNome="'Projeto'" :subtituloValor="item.projeto"
          :ativo="true" :mostrarStatus="false" :mostrarHistorico="false"
          :detalhes="[
            { icone: 'fa7-solid:building-columns', texto: item.nomeBanco || 'Sem Banco' },
            { icone: 'fa7-solid:sack-dollar', texto: `Saldo: R$ ${formatarMoeda(item.saldoProjeto)}` }
          ]" 
          @ver-detalhes="abrirModalExtrato(item.codigoProjeto)">
          <template #footer-actions>
             <AppBotao variacao="acao" icone="fa7-solid:chart-line" class="flex-1" @click="abrirModalExtrato(item.codigoProjeto)">Ver Extrato</AppBotao>
          </template>
        </AppCardListagem>
      </template>

    </AppContainerListagem>

    <AppExtratoDetalhadoModal
      :isOpen="modalExtratoAberto"
      :id="projetoSelecionado"
      tipo="projeto"
      @close="modalExtratoAberto = false"
    />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">

      <div class="md:col-span-2">
         <AppSelect v-model="filtro.projetoParam" label="Filtrar por Projeto" placeholder="Todos os Projetos"
          itemValue="codigo" itemLabel="descricao"
          :opcoes="projetosFormatados" />
      </div>

      <div class="md:col-span-2">
        <AppSelect v-model="filtro.contaVinculadaParam" label="Filtrar por Conta" placeholder="Todas as Contas"
          itemValue="codigo" itemLabel="descricao"
          :opcoes="contasAtivas.map(c => ({ codigo: c.codigo, descricao: c.nomeBanco }))" />
      </div>

    </AppModalFiltroAvancado>

    <AppModalExibicao :aberto="modalExibicaoAberto" :colunas="colunasTemp" :labels="labels" @aplicar="aplicarExibicao"
      @close="modalExibicaoAberto = false" />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro, buscarLista,
  abrirModalExibicao, modalExibicaoAberto, colunas, labels, aplicarExibicao, colunasTemp,
  projetosAtivos, contasAtivas, projetosFormatados,
  modalExtratoAberto, projetoSelecionado, abrirModalExtrato,
  sugestoesNome, buscandoSugestoes, mostrandoSugestoes,
  buscarSugestoesNome, selecionarSugestao, fecharSugestoesDelay, placeholderDinamico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  formatarMoeda,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useExtratoProjetoListagem()

const gerarExcel = () => {
    alert('📊 Gerando extrato de projetos (Excel)...')
}

const gerarPdf = () => {
    alert('📄 Gerando extrato de projetos (PDF)...')
}
</script>