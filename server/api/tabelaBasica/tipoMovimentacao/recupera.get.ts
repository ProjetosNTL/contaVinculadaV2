import { useDb } from '../../../utils/db'

export default defineEventHandler(async () => {
    try {
        const db = await useDb()
        const request = db.request()

        const query = `
            SELECT codigo, descricao 
            FROM tabelaBasica.tipoMovimentacao 
            WHERE ativo = 1 
            ORDER BY descricao ASC
        `
        const result = await request.query(query)

        return result.recordset || []
    } catch (err: any) {
        console.error('Erro ao buscar Tipos de Movimentação:', err)
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro ao buscar Tipos de Movimentação'
        })
    }
})
