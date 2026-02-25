import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const db = await useDb()

    const projeto = query.projeto ? parseInt(query.projeto as string) : null

    try {
        const request = db.request()

        let sql = `
            SELECT CP.codigo, CP.projeto, B.nomeBanco as banco, CP.agencia, CP.conta 
            FROM cadastro.projetoContaVinculada CP
            LEFT JOIN tabelaBasica.banco B ON B.codigo = CP.banco
            WHERE CP.ativo = 1
        `

        if (projeto && projeto !== 0) {
            request.input('projeto', projeto)
            sql += ` AND CP.projeto = @projeto `
        }

        sql += ` ORDER BY B.nomeBanco `

        const result = await request.query(sql)

        // Formata para o frontend
        const contas = result.recordset.map((r: any) => ({
            codigo: r.codigo,
            banco: r.banco,
            conta: r.conta,
            projeto: r.projeto,
            label: `${r.conta} - ${r.banco}`
        }))

        return {
            status: 'success',
            data: contas
        }

    } catch (error: any) {
        console.error('Erro ao listar contas vinculadas:', error)
        return { status: 'failed', mensagem: 'Erro na API de contas: ' + error.message }
    }
})
