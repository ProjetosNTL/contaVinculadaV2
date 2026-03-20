<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina tituloFino="Extrato" tituloGrosso="Funcionário"
      descricao="Visualize saldos e movimentações detalhadas por colaborador" icone="fa7-solid:user-check" />

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
         <AppBotao variacao="padrao" icone="fa7-solid:chart-pie" @click="navigateTo('/operacao/movimentacaoBancaria/extratoProjeto')">
           Ir para Extrato Projeto
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
        <th v-if="colunas.funcionario" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-left">Colaborador</th>
        <th v-if="colunas.cpf" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-40">CPF</th>
        <th v-if="colunas.projeto" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-60">Projeto Atual</th>
        <th v-if="colunas.saldo" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-48">Saldo Acumulado</th>
        <th v-if="colunas.acoes" scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-28">Extrato</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td v-if="colunas.funcionario" class="px-6 py-4">
           <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm shrink-0">
              {{ item.nomeCompleto.charAt(0).toUpperCase() }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{{ item.nomeCompleto }}</span>
              <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ item.email || 'E-mail não informado' }}</span>
            </div>
          </div>
        </td>
        <td v-if="colunas.cpf" class="px-6 py-4 text-center w-40">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">{{ item.cpf }}</span>
        </td>
        <td v-if="colunas.projeto" class="px-6 py-4 text-center w-60">
          <div class="flex flex-col items-center">
            <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400">{{ item.apelido }}</span>
            <span class="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{{ item.projeto }}</span>
          </div>
        </td>
        <td v-if="colunas.saldo" class="px-6 py-4 text-center font-black w-48" :class="Number(item.saldo) >= 0 ? 'text-emerald-600' : 'text-red-500'">
          R$ {{ formatarMoeda(item.saldo) }}
        </td>
        <td v-if="colunas.acoes" class="px-6 py-4 text-center w-28">
           <div class="flex items-center justify-center">
            <button @click.stop="abrirModalExtrato(item.codigoFuncionario)"
              class="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
              title="Ver Extrato Detalhado">
              <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5" />
            </button>
          </div>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem :titulo="item.nomeCompleto" :subtituloNome="'CPF'" :subtituloValor="item.cpf"
          :ativo="true" :mostrarStatus="false" :mostrarHistorico="false"
          :detalhes="[
            { icone: 'fa7-solid:briefcase', texto: `${item.apelido}` },
            { icone: 'fa7-solid:sack-dollar', texto: `Saldo: R$ ${formatarMoeda(item.saldo)}` }
          ]" 
          @ver-detalhes="abrirModalExtrato(item.codigoFuncionario)">
          <template #footer-actions>
             <AppBotao variacao="acao" icone="fa7-solid:user-tag" class="flex-1" @click="abrirModalExtrato(item.codigoFuncionario)">Ver Extrato</AppBotao>
          </template>
        </AppCardListagem>
      </template>

    </AppContainerListagem>

    <AppExtratoDetalhadoModal 
      :isOpen="modalExtratoAberto" 
      :id="funcionarioSelecionado" 
      tipo="funcionario"
      @close="modalExtratoAberto = false" 
    />

    <AppModalFiltroAvancado :aberto="modalFiltroAvancadoAberto" @close="modalFiltroAvancadoAberto = false"
      @limpar="limparFiltrosAvancados" @aplicar="aplicarFiltroAvancado">

      <div class="md:col-span-2">
        <AppSelect v-model="filtro.projetoParam" label="Filtrar por Projeto" placeholder="Todos os Projetos"
          itemValue="codigo" itemLabel="descricao"
          :opcoes="projetosFormatados" />
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
  projetosAtivos, projetosFormatados,
  modalExtratoAberto, funcionarioSelecionado, abrirModalExtrato,
  sugestoesNome, buscandoSugestoes, mostrandoSugestoes,
  buscarSugestoesNome, selecionarSugestao, fecharSugestoesDelay, placeholderDinamico,
  modalFiltroAvancadoAberto, abrirModalFiltroAvancado, limparFiltrosAvancados, aplicarFiltroAvancado,
  formatarMoeda,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useExtratoFuncionarioListagem()

const gerarExcel = () => {
    alert('📊 Gerando extrato consolidado (Excel)...')
}

const gerarPdf = () => {
    alert('📄 Gerando extrato consolidado (PDF)...')
}
</script>