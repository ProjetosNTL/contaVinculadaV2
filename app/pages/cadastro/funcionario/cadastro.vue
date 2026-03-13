<template>
  <div class="min-h-full flex flex-col gap-6 p-4 md:p-8 animate-fade-in">
    
    <AppBarraNavegacao 
      icone="fa7-solid:users" 
      :links="[{ label: 'Funcionários', to: '/cadastro/funcionario' }]"
      :paginaAtual="editando ? form.nomeCompleto || 'Editando Registro' : 'Novo Registro'"
    />

    <AppCartaoFormulario>
      <AppSobreposicaoCarregamento :carregando="carregandoTela" mensagem="Carregando dados do funcionário..." />

      <form v-if="!carregandoTela" @submit.prevent="gravarRegistro" class="space-y-8 relative z-0">
        <AppFormularioSecao icone="fa7-solid:file-lines">
          Dados Principais
        </AppFormularioSecao>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-8">
          <div class="md:col-span-8">
            <AppInputTexto v-model="form.nomeCompleto" label="Nome Completo" placeholder="Digite o nome completo do funcionário..." required maxlength="60" icone="fa7-solid:user" />
          </div>
          
          <div class="md:col-span-4">
            <AppInputCpf v-model="form.cpf" required />
          </div>

          <div class="md:col-span-3">
            <AppInputTexto v-model="form.matricula" label="Matrícula" placeholder="Ex: 12345" required icone="fa7-solid:id-badge" />
          </div>

          <div class="md:col-span-4">
            <AppInputEmail v-model="form.email" required maxlength="50" />
          </div>

          <div class="md:col-span-5">
            <AppSelect 
              v-model="form.projeto" 
              label="Projeto Responsável" 
              placeholder="Selecione o projeto na lista..." 
              :opcoes="projetosFormatados" 
              itemValue="codigo" 
              itemLabel="label" 
              required 
            />
          </div>
        </div>

        <AppRodapeFormulario 
          :editando="editando" 
          :carregandoGravar="carregandoGravacao"
          @voltar="voltarParaLista"
          @excluir="abrirModalExclusao"
          @limpar="limparFormulario"
        />
      </form>
    </AppCartaoFormulario>

    <AppModal 
      :isOpen="modalExclusaoAberto" 
      title="Atenção: Exclusão" 
      icon="fa7-solid:triangle-exclamation"
      @close="fecharModal"
    >
      <div class="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300">
         <p class="text-lg text-center font-bold">Confirma a exclusão permanente deste funcionário?</p>
         <p class="text-sm text-center mt-2 opacity-80">Esta ação não poderá ser desfeita e removerá os dados do banco.</p>
      </div>
      <template #footer>
        <AppBotao variacao="padrao" @click="fecharModal">
          Cancelar
        </AppBotao>
        
        <AppBotao variacao="perigo" icone="fa7-solid:trash" :carregando="carregandoExclusao" @click="excluirRegistro">
          Sim, Excluir
        </AppBotao>
      </template>
    </AppModal>

    <AppModal 
      :isOpen="modalAlertaAberto" 
      :title="modalAlertaTitulo" 
      icon="fa7-solid:circle-exclamation"
      @close="fecharModalAlerta"
    >
      <div class="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">
         <p class="text-base text-center font-medium">{{ modalAlertaMensagem }}</p>
      </div>
      <template #footer>
        <AppBotao variacao="primario" @click="fecharModalAlerta" class="w-full sm:w-auto">
          Entendi
        </AppBotao>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'

const {
  carregandoTela, carregandoGravacao, carregandoExclusao, modalExclusaoAberto, form, editando,
  projetosAtivos, carregarProjetos, carregarDados, voltarParaLista, limparFormulario,
  abrirModalExclusao, fecharModal, gravarRegistro, excluirRegistro,
  cpfInvalido, emailInvalido,
  modalAlertaAberto, modalAlertaTitulo, modalAlertaMensagem, fecharModalAlerta 
} = useFuncionarioFormulario()

const projetosFormatados = computed(() => {
  return projetosAtivos.value.map(p => ({
    codigo: p.codigo,
    label: `${p.apelido} - ${p.descricao}`
  }))
})

onMounted(() => { 
  carregarProjetos()
  carregarDados() 
})
</script>