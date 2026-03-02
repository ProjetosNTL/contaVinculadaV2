import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    // TODO: Pegar o Id do usuário logado através da sessão
    const usuarioId = 1 // fixo provisoriamente

    const { codigo, cpf, matricula, nomeCompleto, email, projeto } = body

    try {
        const request = db.request()

        // Verifica CPF e Matrícula únicos
        const requestCheck = db.request()
        requestCheck.input('codigo', codigo || 0)
        requestCheck.input('cpf', cpf)
        requestCheck.input('matricula', matricula)

        const resultCpf = await requestCheck.query(`SELECT codigo FROM cadastro.funcionario WHERE codigo != @codigo AND cpf = @cpf`)
        if (resultCpf.recordset.length > 0) {
            return { status: 'failed', mensagem: 'CPF já cadastrado.' }
        }

        const resultMatricula = await requestCheck.query(`SELECT codigo FROM cadastro.funcionario WHERE codigo != @codigo AND matricula = @matricula`)
        if (resultMatricula.recordset.length > 0) {
            return { status: 'failed', mensagem: 'Matrícula já cadastrada.' }
        }

        // Executa a procedure
        request.input('codigo', codigo || 0)
        request.input('nomeCompleto', nomeCompleto)
        request.input('cpf', cpf)
        request.input('matricula', matricula)
        request.input('email', email)
        request.input('projeto', parseInt(projeto))
        request.input('usuario', usuarioId)
        request.input('ativo', 1)

        // A procedure original não usava nomes de parametros explicitos ou usava a ordem correta
        // Vamos chamar por EXEC
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

        return { status: 'success', mensagem: 'Operação realizada.' }

    } catch (error: any) {
        console.error('Erro na gravação do funcionário:', error)
        return { status: 'failed', mensagem: 'Operação não realizada: ' + error.message }
    }
})
