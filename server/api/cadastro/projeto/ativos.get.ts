import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const db = await useDb()

    try {
        const request = db.request()
        const query = `
      SELECT codigo, descricao, apelido 
      FROM cadastro.projeto 
      WHERE ativo = 1
      ORDER BY apelido ASC
    `
        const result = await request.query(query)

        return {
            status: 'success',
            data: result.recordset
        }
    } catch (error: any) {
        console.error('Erro ao buscar projetos ativos:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao buscar projetos: ' + error.message
        })
    }
})
