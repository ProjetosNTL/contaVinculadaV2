<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">

    <AppCabecalhoPagina 
      tituloFino="Importação de" 
      tituloGrosso="Contracheques"
      descricao="Envie o arquivo TXT de retenções para processamento e aprovação" 
      icone="fa7-solid:file-arrow-up" 
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="importando" mensagem="Realizando upload e processando arquivo..." />

      <form v-if="!importando" @submit.prevent="importarArquivo" class="space-y-12 relative z-0">
        
        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 mt-6">
            
            <div class="md:col-span-12 lg:col-span-8 space-y-8">
                <AppFormularioSecao icone="fa7-solid:calendar-check">
                    Informações da Remessa
                </AppFormularioSecao>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AppInputTexto v-model="form.ano" label="Mês/Ano de Referência" placeholder="MM/AAAA" v-maska="'##/####'" icone="fa7-solid:calendar-circle-exclamation" required />
                    
                    <div class="flex flex-col">
                        <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Última Atividade</label>
                        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center gap-3">
                            <Icon name="fa7-solid:clock-rotate-left" class="w-4 h-4 text-emerald-500" />
                            <span class="text-xs font-bold text-gray-700 dark:text-gray-200">{{ ultimaImportacao }}</span>
                        </div>
                    </div>
                </div>

                <AppFormularioSecao icone="fa7-solid:file-import">
                    Arquivo de Retenções
                </AppFormularioSecao>

                <AppInputArquivo 
                    v-model="arquivoSelecionado" 
                    accept=".txt" 
                    label="Selecione o arquivo .txt gerado pelo RH" 
                    required 
                    @change="aoSelecionarArquivo"
                />

                <div class="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-500/20 rounded-2xl flex gap-3">
                    <Icon name="fa7-solid:circle-exclamation" class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p class="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-tight">Regras de Formatação</p>
                        <p class="text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed mt-1">O arquivo deve ser formato texto simples (.txt) e conter as colunas de Matrícula, CPF e Verbas conforme o layout padrão da prefeitura. O limite de tamanho é 1MB.</p>
                    </div>
                </div>
            </div>

            <!-- Coluna de Ajuda/Status -->
            <div class="md:col-span-12 lg:col-span-4">
                <div class="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 h-full space-y-6 shadow-inner">
                    <h4 class="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <Icon name="fa7-solid:circle-info" /> Fluxo de Trabalho
                    </h4>
                    
                    <div class="space-y-4">
                        <div class="flex items-start gap-4">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-500/20">1</div>
                            <p class="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">Selecione o período de referência para as retenções.</p>
                        </div>
                        <div class="flex items-start gap-4 opacity-70">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-500/20">2</div>
                            <p class="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">Suba o arquivo .txt e clique em importar para processar.</p>
                        </div>
                        <div class="flex items-start gap-4 opacity-50">
                            <div class="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-500/20">3</div>
                            <p class="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed">Vá para a tela de processamento para conferir e aprovar.</p>
                        </div>
                    </div>

                    <div class="h-px bg-gray-200 dark:bg-gray-800"></div>

                    <AppBotao variacao="padrao" icone="fa7-solid:cog" @click="irParaProcessamento" class="w-full">
                        Ir para Processamento
                    </AppBotao>
                </div>
            </div>

        </div>

        <AppRodapeFormulario 
          labelVoltar="Retornar ao Dashboard"
          labelGravar="Importar Arquivo"
          iconeGravar="fa7-solid:upload"
          @voltar="navigateTo('/')"
          @gravar="importarArquivo"
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal Pós-Importação -->
    <AppModal :isOpen="modalImportadosAberto" title="Importação Finalizada" icon="fa7-solid:cloud-check" tamanho="sm" @close="modalImportadosAberto = false" rodapeEntre>
      <div class="flex flex-col items-center py-6 text-center">
        <div class="relative mb-6 scale-125">
            <div class="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
            <div class="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
                <Icon name="fa7-solid:check" class="w-8 h-8 text-white" />
            </div>
        </div>
        
        <h4 class="text-xl font-black text-gray-900 dark:text-white mb-2">
          Sucesso!
        </h4>
        
        <p class="text-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-[240px]">
          O arquivo foi importado e processado com êxito. Deseja conferir os dados para aprovação agora?
        </p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="modalImportadosAberto = false">Depois</AppBotao>
        <AppBotao variacao="primario" icone="fa7-solid:arrow-right" @click="irParaProcessamento">Sim, processar</AppBotao>
      </template>
    </AppModal>

  </div>
</template>

<script setup lang="ts">
const {
  form, arquivoSelecionado, ultimaImportacao, importando, modalImportadosAberto,
  aoSelecionarArquivo, importarArquivo, irParaProcessamento
} = useContrachequeImportacao()
</script>