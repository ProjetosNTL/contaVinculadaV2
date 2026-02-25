import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const { lancamentoReembolso } = body

    if (!lancamentoReembolso) {
        return { status: 'failed', mensagem: 'ID do lançamento não informado.' }
    }

    try {
        const request = db.request()
        request.input('lancamentoReembolso', parseInt(lancamentoReembolso))

        const sql = `
            SELECT F.nomeCompleto AS funcionario 
            FROM operacao.lancamentoReembolsoFuncionario LR
            LEFT JOIN cadastro.funcionario F ON F.codigo = LR.funcionario
            WHERE LR.lancamentoReembolso = @lancamentoReembolso
        `

        const result = await request.query(sql)

        return {
            status: 'success',
            data: result.recordset
        }

    } catch (error: any) {
        console.error('Erro ao recuperar funcionários do lançamento reembolso:', error)
        return { status: 'failed', mensagem: 'Erro na API: ' + error.message }
    }
})
