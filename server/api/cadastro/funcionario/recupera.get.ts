import { useDb } from '../../../utils/db'
import { comum } from '../../../utils/comum'

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
      SELECT codigo, nomeCompleto, cpf, matricula, email, projeto, ativo 
      FROM cadastro.Funcionario 
      WHERE codigo = @codigo
    `
        const result = await request.query(sql)

        if (result.recordset.length > 0) {
            const f = result.recordset[0]
            return {
                status: 'success',
                data: {
                    ...f,
                    dataAdmissao: comum.formatarDataBr(f.dataAdmissao)
                }
            }
        } else {
            return { status: 'failed', mensagem: 'Funcionário não encontrado.' }
        }
    } catch (error: any) {
        console.error('Erro ao recuperar funcionário:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao recuperar funcionário: ' + error.message
        })
    }
})
