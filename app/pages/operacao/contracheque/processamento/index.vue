<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Processamento de" 
      tituloGrosso="Contracheques"
      descricao="Analise e aprove as retenções processadas via importação" 
      icone="fa7-solid:gears" 
    />

    <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-2">
            <AppInputTexto v-model="filtro.mesAno" label="Mês/Ano" placeholder="MM/AAAA" v-maska="'##/####'" icone="fa7-solid:calendar-days" />
        </div>
        <div class="md:col-span-4">
            <AppSelect 
                v-model="filtro.projeto" 
                label="Projeto" 
                placeholder="Todos os projetos" 
                :opcoes="projetos" 
                itemValue="codigo" 
                itemLabel="apelido"
            />
        </div>
        <div class="md:col-span-4">
            <AppSelect 
                v-model="filtro.funcionarioId" 
                label="Funcionário" 
                placeholder="Todos os funcionários" 
                :opcoes="funcionarios" 
                itemValue="codigo" 
                itemLabel="nomeCompleto"
            />
        </div>
        <div class="md:col-span-2">
            <AppSelect 
                v-model="filtro.status" 
                label="Status Aprovação" 
                placeholder="Selecione..." 
                :opcoes="[{codigo: '2', descricao: 'Pendentes'}, {codigo: '1', descricao: 'Aprovados'}, {codigo: '0', descricao: 'Reprovados'}]" 
                itemValue="codigo" 
                itemLabel="descricao"
            />
        </div>
      </div>

      <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
            <AppBotao variacao="padrao" icone="fa7-solid:upload" @click="navigateTo('/operacao/contracheque/importacao')">
                Ir p/ Importação
            </AppBotao>
            <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>
            <AppBotao v-if="filtro.status === '2'" variacao="sucesso" icone="fa7-solid:check" @click="processarContracheque(1)">
                Aprovar
            </AppBotao>
            <AppBotao v-if="filtro.status === '2'" variacao="perigo" icone="fa7-solid:xmark" @click="processarContracheque(0)">
                Reprovar
            </AppBotao>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            <button @click="visaoAtual = 'lista'"
              :class="visaoAtual === 'lista' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
              class="px-4 py-2 rounded-lg text-sm transition-all">
              <Icon name="fa7-solid:list" class="w-4 h-4" />
            </button>
            <button @click="visaoAtual = 'cards'"
              :class="visaoAtual === 'cards' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
              class="px-4 py-2 rounded-lg text-sm transition-all">
              <Icon name="fa7-solid:border-all" class="w-4 h-4" />
            </button>
          </div>
          <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarProcessamentos">
            Filtrar Registros
          </AppBotao>
        </div>
      </div>
    </div>

    <AppContainerListagem 
      :carregando="carregando" 
      :buscaRealizada="buscaRealizada" 
      :lista="dados || []"
      :visaoAtual="visaoAtual" 
      :registroInicial="registroInicial" 
      :registroFinal="registroFinal"
      :totalRegistros="totalRegistros" 
      :itensPorPagina="itensPorPagina" 
      :totalPaginas="totalPaginas"
      :paginaAtual="paginaAtual" 
      :paginasExibidas="paginasExibidas" 
      @mudarPagina="mudarPagina"
      @mudarItensPorPagina="mudarItensPorPagina"
    >
      <template #cabecalho-tabela>
        <th v-if="filtro.status === '2'" class="px-6 py-4 text-center">
            <button @click="marcarDesmarcarTodos" class="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition-colors">
                <Icon name="fa7-solid:square-check" class="w-4 h-4" />
            </button>
        </th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Funcionário</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Projeto</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Líquido</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Vlr. Retido</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ação</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td v-if="filtro.status === '2'" class="px-6 py-4 text-center">
            <input type="checkbox" v-model="item.selecionado" class="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ item.funcionario }}</span>
                <span class="text-[10px] text-gray-500 uppercase tracking-tighter">{{ item.cpf }} | Mat: {{ item.matricula }}</span>
            </div>
        </td>
        <td class="px-6 py-4 text-center">
          <span class="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700 capitalize">{{ item.projeto }}</span>
        </td>
        <td class="px-6 py-4 text-right font-bold text-sm text-gray-700 dark:text-gray-300">
          {{ Number(item.valorLiquido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
        </td>
        <td class="px-6 py-4 text-right font-black text-sm text-emerald-600 dark:text-emerald-400">
          {{ Number(item.valorRetencao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
        </td>
        <td class="px-6 py-4 text-center">
            <span v-if="item.statusAprovacao === 0" class="px-2 py-1 rounded text-[10px] font-black uppercase bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-500/20">Reprovado</span>
            <span v-else-if="item.statusAprovacao === 1" class="px-2 py-1 rounded text-[10px] font-black uppercase bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Aprovado</span>
            <span v-else class="px-2 py-1 rounded text-[10px] font-black uppercase bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">Pendente</span>
        </td>
        <td class="px-6 py-4 text-right">
            <button @click="abrirModalDetalhes(item.codigo)" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all" title="Ver Verbas">
                <Icon name="fa7-solid:sack-dollar" class="w-5 h-5" />
            </button>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.funcionario" 
          :subtituloNome="item.projeto" 
          :subtituloValor="Number(item.valorRetencao).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })"
          :ativo="true"
          :detalhes="[
            { icone: 'fa7-solid:address-card', texto: `CPF: ${item.cpf}` },
            { icone: 'fa7-solid:hashtag', texto: `Mat: ${item.matricula}` }
          ]" 
          @ver-detalhes="abrirModalDetalhes(item.codigo)" 
          @clique-titulo="abrirModalDetalhes(item.codigo)" 
        >
            <template #badge>
                <div v-if="filtro.status === '2'" class="absolute top-4 right-4 z-20">
                    <input type="checkbox" v-model="item.selecionado" class="w-5 h-5 rounded-lg border-emerald-200 text-emerald-600 focus:ring-emerald-500 cursor-pointer shadow-sm" />
                </div>
            </template>
        </AppCardListagem>
      </template>
    </AppContainerListagem>

    <!-- Modal Detalhes Verba -->
    <AppModal :isOpen="modalDetalhesAberto" title="Detalhamento por Verba" icon="fa7-solid:magnifying-glass-dollar" tamanho="5xl" @close="modalDetalhesAberto = false" rodapeEntre>
        <div class="overflow-x-auto p-2 lg:p-4">
            <table class="w-full text-center border-collapse whitespace-nowrap rounded-2xl overflow-hidden">
                <thead class="bg-gray-50 dark:bg-gray-900/50">
                    <tr class="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                        <th class="p-4 text-left">Verba</th>
                        <th class="p-4">Vlr Verba</th>
                        <th class="p-4 bg-emerald-50/20 dark:bg-emerald-500/5">Vlr Décimo</th>
                        <th class="p-4 bg-emerald-50/20 dark:bg-emerald-500/5">%</th>
                        <th class="p-4 bg-blue-50/20 dark:bg-blue-500/5">Vlr Férias</th>
                        <th class="p-4 bg-blue-50/20 dark:bg-blue-500/5">%</th>
                        <th class="p-4 bg-amber-50/20 dark:bg-amber-500/5">Vlr Multa</th>
                        <th class="p-4 bg-amber-50/20 dark:bg-amber-500/5">%</th>
                        <th class="p-4 bg-indigo-50/20 dark:bg-indigo-500/5">Submódulo</th>
                        <th class="p-4 bg-indigo-50/20 dark:bg-indigo-500/5">%</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr v-for="det in detalhesVerba" :key="det.codigo" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 text-xs text-gray-600 dark:text-gray-300 transition-colors">
                        <td class="p-4 text-left font-bold text-gray-900 dark:text-white">{{ det.verbaDescricao }}</td>
                        <td class="p-4 font-black text-gray-700 dark:text-gray-200">
                             {{ Number(det.valorVerba).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/10 dark:bg-emerald-500/5">
                            {{ Number(det.valorDecimoTerceiro).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-[10px] font-bold text-gray-400 bg-emerald-50/10 dark:bg-emerald-500/5">
                            {{ det.percentualDecimoTerceiro }}%
                        </td>
                        <td class="p-4 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/10 dark:bg-blue-500/5">
                            {{ Number(det.valorFerias).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-[10px] font-bold text-gray-400 bg-blue-50/10 dark:bg-blue-500/5">
                            {{ det.percentualFerias }}%
                        </td>
                        <td class="p-4 text-amber-600 dark:text-amber-400 font-bold bg-amber-50/10 dark:bg-amber-500/5">
                            {{ Number(det.valorMultaFgts).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-[10px] font-bold text-gray-400 bg-amber-50/10 dark:bg-amber-500/5">
                            {{ det.percentualMultaFgts }}%
                        </td>
                        <td class="p-4 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/10 dark:bg-indigo-500/5">
                            {{ Number(det.valorSubmodulo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
                        </td>
                        <td class="p-4 text-[10px] font-bold text-gray-400 bg-indigo-50/10 dark:bg-indigo-500/5">
                            {{ det.percentualSubmodulo }}%
                        </td>
                    </tr>
                    <tr v-if="detalhesVerba.length === 0">
                        <td colspan="10" class="p-12 text-center text-gray-400 italic">Nenhum detalhe de verba processado para este registro.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <template #footer>
            <AppBotao variacao="padrao" @click="modalDetalhesAberto = false" class="px-8">Fechar Detalhes</AppBotao>
            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest hidden lg:block">As verbas são calculadas automaticamente conforme as regras vigentes do projeto.</p>
        </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscarProcessamentos, projetos, funcionarios, detalhesVerba, modalDetalhesAberto, abrirModalDetalhes,
  processarContracheque, marcarDesmarcarTodos,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = useContrachequeProcessamento()
</script>