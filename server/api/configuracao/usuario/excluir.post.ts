import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const usuarioLogadoId = 1 // TODO: Pegar do auth/session
    const { codigo } = body

    if (!codigo) {
        return { status: 'failed', mensagem: 'Nenhum registro selecionado.' }
    }

    try {
        const request = db.request()
        request.input('codigo', codigo)

        const resultQuery = await request.query(`SELECT U.* FROM configuracao.usuario U WHERE U.codigo = @codigo`)
        if (resultQuery.recordset.length === 0) {
            return { status: 'failed', mensagem: 'Usuário não encontrado.' }
        }

        const u = resultQuery.recordset[0]

        request.input('login', u.login)
        request.input('nomeUsuario', u.nomeUsuario)
        request.input('cpf', u.cpf)
        request.input('email', u.email)
        request.input('senha', u.senha)
        request.input('telefone', u.telefone)
        request.input('restauraSenha', parseInt(u.restauraSenha))
        request.input('usuarioLogado', usuarioLogadoId)
        request.input('xmlProjeto', null)
        request.input('ativo', 0)

        const result = await request.query(`
      EXEC configuracao.usuario_atualiza 
        @codigo = @codigo,
        @login = @login,
        @nomeUsuario = @nomeUsuario,
        @cpf = @cpf,
        @email = @email,
        @senha = @senha,
        @telefone = @telefone,
        @restauraSenha = @restauraSenha,
        @usuario = @usuarioLogado,
        @xmlProjeto = @xmlProjeto,
        @ativo = @ativo
    `)

        return { status: 'success', mensagem: 'Operação realizada (Usuário inativado).' }

    } catch (error: any) {
        console.error('Erro na exclusão do usuário:', error)
        return { status: 'failed', mensagem: 'Operação não realizada: ' + error.message }
    }
})
