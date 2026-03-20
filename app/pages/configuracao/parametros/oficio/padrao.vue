<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in text-gray-900 dark:text-gray-100">
    <AppBarraNavegacao 
      icone="fa7-solid:pen-nib" 
      :links="[{ label: 'Parâmetros de Ofício', to: '/configuracao/parametros/oficio' }]"
      paginaAtual="Redação Base (Padrão)"
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="salvando" mensagem="Gravando configuração sistêmica..." />

      <form @submit.prevent="gravar" class="space-y-8 relative z-0">
        <AppFormularioSecao icone="fa7-solid:clipboard-check">
            Configuração Fundamental
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8 mt-6">
            <div class="md:col-span-12 lg:col-span-6 flex flex-col gap-6">
                <AppSelect 
                    v-model="padrao.tipoSaldo" 
                    label="Modelo de Matriz" 
                    placeholder="Selecione o modelo da matriz..." 
                    :opcoes="[{codigo: '0', descricao: 'Sem Saldo (Matriz Base)'}, {codigo: '1', descricao: 'Com Saldo (Cita Valores)'}]" 
                    itemValue="codigo" 
                    itemLabel="descricao"
                    required 
                />
                
                <div class="p-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-start gap-3 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-500/10 shadow-sm grow cursor-default">
                    <Icon name="fa7-solid:wand-magic-sparkles" class="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p class="font-bold uppercase tracking-wider mb-1 text-[11px]">Automação Injetável</p>
                        <p class="leading-relaxed">A matriz armazenada aqui funcionará como um esqueleto (Base Automática) quando o usuário iniciar o preenchimento de um novo Ofício na tela raiz. Adote as "Tags Rápidas" disponíveis ao lado para mapear localizações precisas de formatação final.</p>
                    </div>
                </div>
            </div>

            <div class="md:col-span-12 lg:col-span-6 flex">
                <div class="bg-gray-50 dark:bg-[#1e2029] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm w-full">
                    <h5 class="flex items-center justify-between gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">
                        <span class="flex items-center gap-2"><Icon name="fa7-solid:tags" class="w-4 h-4" /> Variáveis Rápidas (Tags)</span>
                        <span class="text-gray-400 tracking-normal opacity-50">Clique para Copiar</span>
                    </h5>
                    <div class="flex flex-wrap gap-2">
                        <code v-for="v in variaveis" :key="v.codigo" @click="copiarVariavel(v.codigo)" title="Copiar" class="px-2.5 py-1.5 cursor-pointer hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400 text-[10px] font-bold font-mono shadow-sm transition-all focus:animate-shake hover:scale-105">
                            {{ v.codigo }}
                        </code>
                    </div>
                </div>
            </div>
        </div>

        <AppFormularioSecao icone="fa7-solid:align-left">
            Redação Oficial Corrente
        </AppFormularioSecao>

        <div class="mt-6 relative rounded-2xl overflow-hidden shadow-inner">
            <AppSobreposicaoCarregamento :carregando="carregandoTela" mensagem="Sincronizando banco de matrizes..." />
            <div :class="{ 'animate-shake': erros.has('texto') }" class="relative z-0">
                <textarea 
                    v-model="padrao.texto" 
                    rows="18" 
                    :disabled="carregandoTela" 
                    class="w-full textarea-scrollbar bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-sm text-gray-800 dark:text-gray-200 leading-relaxed shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-serif"
                    placeholder="Inicie a redação do esqueleto base..."
                    required>
                </textarea>
            </div>
        </div>

        <AppRodapeFormulario 
          editando
          :carregandoGravar="salvando"
          labelGravar="Confirmar e Salvar Matriz"
          @voltar="voltar"
          semBotaoLimpar
          semBotaoExcluir
        />
      </form>
    </AppCartaoFormulario>

    <!-- Modal Alerta Erro -->
    <AppModal :isOpen="modalAlertaAberto" :title="modalAlertaTitulo" icon="fa7-solid:circle-exclamation" @close="fecharModalAlerta">
      <div class="p-6 text-center">
         <p class="text-base font-bold text-gray-700 dark:text-gray-200">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full">Entendi</AppBotao>
      </template>
    </AppModal>

    <!-- Modal Sucesso -->
    <AppModal :isOpen="modalSucessoAberto" title="Sucesso" icon="fa7-solid:circle-check" semScroll @close="voltar">
      <div class="flex flex-col items-center py-6 text-center">
        <div class="relative mb-8">
          <div class="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div class="relative w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl"><Icon name="fa7-solid:check" class="w-12 h-12 text-white" /></div>
        </div>
        <h3 class="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Registro Autenticado</h3>
        <p class="text-gray-500 dark:text-gray-400 text-lg mb-8">A base sistêmica de ofícios acaba de assimilar sua nova matriz.</p>
      </div>
      <template #footer><AppBotao variacao="primario" @click="voltar" class="w-full h-14 text-lg rounded-2xl">Voltar ao Menu Principal</AppBotao></template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
const {
  carregandoTela, salvando, padrao, variaveis,
  carregarModelo, gravar, voltar, copiarVariavel,
  erros, modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta, modalSucessoAberto
} = useParametrosOficioPadrao()
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  50% { transform: translateX(8px); }
  75% { transform: translateX(-4px); }
}
.animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
.animate-shake :deep(input), .animate-shake :deep(select), .animate-shake :deep(textarea) { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
.dark .animate-shake :deep(input), .dark .animate-shake :deep(textarea), .dark .animate-shake :deep(select) { background-color: rgba(239, 68, 68, 0.05) !important; }

/* Custom Scrollbar for the Textarea */
.textarea-scrollbar::-webkit-scrollbar { width: 8px; }
.textarea-scrollbar::-webkit-scrollbar-track { background: transparent; margin-block: 8px; }
.textarea-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 8px; border: 2px solid transparent; background-clip: padding-box; }
.dark .textarea-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border: 2px solid transparent; background-clip: padding-box; }
.textarea-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #10b981; }
</style>
