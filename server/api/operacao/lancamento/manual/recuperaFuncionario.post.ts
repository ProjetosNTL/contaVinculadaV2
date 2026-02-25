import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const { lancamentoManual } = body

    if (!lancamentoManual) {
        return { status: 'failed', mensagem: 'ID do lançamento não informado.' }
    }

    try {
        const request = db.request()
        request.input('lancamentoManual', parseInt(lancamentoManual))

        const sql = `
            SELECT F.nomeCompleto AS funcionario 
            FROM operacao.lancamentoManualFuncionario LM
            LEFT JOIN cadastro.funcionario F ON F.codigo = LM.funcionario
            WHERE LM.lancamentoManual = @lancamentoManual
        `

        const result = await request.query(sql)

        return {
            status: 'success',
            data: result.recordset
        }

    } catch (error: any) {
        console.error('Erro ao recuperar funcionários do lançamento:', error)
        return { status: 'failed', mensagem: 'Erro na API: ' + error.message }
    }
})
