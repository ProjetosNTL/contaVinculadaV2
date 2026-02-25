import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const codigo = parseInt(query.codigo as string)

    if (!codigo) {
        return { status: 'failed', mensagem: 'Código não fornecido.' }
    }

    const db = await useDb()

    try {
        const request = db.request()
        request.input('codigo', codigo)

        const sql = `
      SELECT U.codigo, U.nomeUsuario, U.cpf, U.telefone, U.email, U.login, U.restauraSenha 
      FROM configuracao.usuario U 
      WHERE U.codigo = @codigo
    `
        const result = await request.query(sql)

        if (result.recordset.length === 0) {
            return { status: 'failed', mensagem: 'Usuário não encontrado.' }
        }

        const userData = result.recordset[0]

        // Fetch projects
        const sqlProjeto = `
      SELECT UP.codigo, UP.projeto 
      FROM configuracao.usuarioProjeto UP
      WHERE UP.usuario = @codigo
    `
        const resultProjeto = await request.query(sqlProjeto)

        // Extraindo apenas os codigos dos projetos para o front-end
        const projetos = resultProjeto.recordset.map(x => x.projeto)

        return {
            status: 'success',
            data: {
                ...userData,
                projetos
            }
        }
    } catch (error: any) {
        console.error('Erro ao recuperar usuário:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao recuperar usuário: ' + error.message
        })
    }
})
