<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Gestão de" 
      tituloGrosso="Permissões"
      descricao="Controle de acessos e privilégios dos usuários do sistema" 
      icone="fa7-solid:shield-halved" 
    />

    <div class="bg-white dark:bg-[#1e2029] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div class="md:col-span-4">
          <AppInputTexto v-model="filtro.login" label="Login" placeholder="Filtrar por login..." icone="fa7-solid:id-badge" />
        </div>
        <div class="md:col-span-4">
          <AppInputTexto v-model="filtro.nomeUsuario" label="Nome do Usuário" placeholder="Filtrar por nome..." icone="fa7-solid:user" />
        </div>
        <div class="md:col-span-4">
          <AppInputCpf v-model="filtro.cpf" />
        </div>
      </div>

      <div class="w-full h-px bg-gray-100 dark:bg-gray-800/80"></div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl border border-gray-100 dark:border-gray-800">
            <button @click="visaoAtual = 'lista'"
              :class="visaoAtual === 'lista' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-bold'"
              class="px-4 py-2 rounded-lg text-sm transition-all">
              <Icon name="fa7-solid:list-ul" class="w-4 h-4" />
            </button>
            <button @click="visaoAtual = 'cards'"
              :class="visaoAtual === 'cards' ? 'bg-white dark:bg-[#1e2029] shadow-sm text-emerald-600 dark:text-emerald-400 border border-gray-200 dark:border-gray-700' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-bold'"
              class="px-4 py-2 rounded-lg text-sm transition-all">
              <Icon name="fa7-solid:border-all" class="w-4 h-4" />
            </button>
          </div>
        </div>
        <AppBotao variacao="primario" icone="fa7-solid:magnifying-glass" @click="buscarUsuarios">
          Pesquisar Usuários
        </AppBotao>
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
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Login</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">CPF</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Histórico</th>
        <th scope="col" class="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
      </template>

      <template #linhas-tabela="{ item }">
        <td class="px-6 py-4">
          <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ item.login }}</span>
        </td>
        <td class="px-6 py-4">
          <div class="flex flex-col">
            <span class="text-sm font-bold text-gray-900 dark:text-gray-100">{{ item.nomeUsuario }}</span>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ item.cpf }}</span>
        </td>
        <td class="px-6 py-4 text-center">
            <button @click="abrirHistorico(item.codigo)" class="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all" title="Ver Histórico">
                <Icon name="fa7-solid:clock-rotate-left" class="w-5 h-5" />
            </button>
        </td>
        <td class="px-6 py-4 text-right px-6 py-4 text-right">
            <NuxtLink :to="`/configuracao/permissaoUsuario/${item.codigo}`" class="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all inline-block" title="Configurar Permissões">
                <Icon name="fa7-solid:user-shield" class="w-5 h-5" />
            </NuxtLink>
        </td>
      </template>

      <template #cards="{ item }">
        <AppCardListagem 
          :titulo="item.login" 
          :subtituloNome="item.nomeUsuario" 
          :subtituloValor="item.cpf"
          :ativo="true"
          :detalhes="[
            { icone: 'fa7-solid:user-shield', texto: 'Controle de Acessos' }
          ]" 
          @ver-detalhes="navigateTo(`/configuracao/permissaoUsuario/${item.codigo}`)" 
          @clique-titulo="navigateTo(`/configuracao/permissaoUsuario/${item.codigo}`)" 
        >
            <template #actions-extra>
                <button @click="abrirHistorico(item.codigo)" class="p-2 text-gray-400 hover:text-blue-500 rounded-lg transition-colors border border-gray-100 dark:border-gray-800" title="Histórico">
                    <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4" />
                </button>
            </template>
        </AppCardListagem>
      </template>
    </AppContainerListagem>

    <!-- Modal Histórico -->
    <AppModalHistorico 
      :aberto="modalHistoricoAberto" 
      :historico="historicoData" 
      @close="modalHistoricoAberto = false" 
    />

  </div>
</template>

<script setup lang="ts">
const {
  carregando, buscaRealizada, visaoAtual, dados, filtro,
  buscarUsuarios, modalHistoricoAberto, historicoData, abrirHistorico,
  registroInicial, registroFinal, totalRegistros, itensPorPagina, totalPaginas, paginaAtual, paginasExibidas,
  mudarPagina, mudarItensPorPagina
} = usePermissaoUsuarioListagem()
</script>