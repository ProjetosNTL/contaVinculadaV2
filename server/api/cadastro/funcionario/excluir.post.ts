import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    // TODO: Pegar o Id do usuário logado através da sessão
    const usuarioId = 1 // fixo provisoriamente

    const { codigo } = body

    if (!codigo) {
        return { status: 'failed', mensagem: 'Nenhum registro selecionado.' }
    }

    try {
        const request = db.request()
        request.input('codigo', codigo)
        const resultQuery = await request.query(`SELECT F.* FROM cadastro.Funcionario F WHERE F.codigo = @codigo`)

        if (resultQuery.recordset.length === 0) {
            return { status: 'failed', mensagem: 'Funcionário não encontrado.' }
        }

        const func = resultQuery.recordset[0]

        // Chamar Procedure passando inativo (ativo = 0)
        request.input('nomeCompleto', func.nomeCompleto)
        request.input('cpf', func.cpf)
        request.input('matricula', func.matricula)
        request.input('email', func.email)
        request.input('projeto', parseInt(func.projeto))
        request.input('usuario', usuarioId)
        request.input('ativo', 0)

        const result = await request.query(`
      EXEC cadastro.Funcionario_Atualiza 
        @codigo = @codigo,
        @nomeCompleto = @nomeCompleto,
        @cpf = @cpf,
        @matricula = @matricula,
        @email = @email,
        @projeto = @projeto,
        @usuario = @usuario,
        @ativo = @ativo
    `)

        return { status: 'success', mensagem: 'Excluído com sucesso (Inativado).' }

    } catch (error: any) {
        console.error('Erro na exclusão do funcionário:', error)
        return { status: 'failed', mensagem: 'Operação não realizada: ' + error.message }
    }
})
