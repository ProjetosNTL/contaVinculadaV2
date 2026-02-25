import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const db = await useDb()

    const term = query.q as string
    const projeto = query.projeto ? parseInt(query.projeto as string) : null

    if (!term || term.length < 3) {
        return { status: 'success', data: [] }
    }

    try {
        const request = db.request()
        request.input('term', `%${term}%`)

        let sql = `
            SELECT F.codigo as id, F.nomeCompleto as descricao 
            FROM cadastro.Funcionario F 
            WHERE F.nomeCompleto LIKE @term COLLATE Latin1_general_CI_AI
        `

        if (projeto && projeto !== 0) {
            request.input('projeto', projeto)
            sql += ` AND F.projeto = @projeto `
        }

        sql += ` ORDER BY F.nomeCompleto `

        const result = await request.query(sql)

        return {
            status: 'success',
            data: result.recordset
        }

    } catch (error: any) {
        console.error('Erro no autocomplete de funcionário:', error)
        return { status: 'failed', mensagem: 'Erro na API de autocomplete: ' + error.message }
    }
})
