import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const { projeto, tipoMovimentacao, dataMovimentacao } = body

    try {
        const request = db.request()

        let sql = `
            SELECT DISTINCT 
                LM.codigo,
                P.descricao AS projeto,
                TM.descricao AS tipoMovimentacao,
                LM.dataMovimentacao,
                LM.valorMovimentacao,
                LM.dataCadastro,
                U.login AS usuarioCadastro,
                CONCAT(C.agencia,'/',C.conta,' - ',B.nomeBanco) AS contaVinculada, 
                CASE WHEN EXISTS(
                    SELECT codigo FROM operacao.lancamentoManualFuncionario WHERE lancamentoManual = LM.codigo
                ) THEN 1 ELSE 0 END AS funcionario,
                LM.motivo
            FROM operacao.lancamentoManual LM
            LEFT JOIN cadastro.projeto P ON P.codigo = LM.projeto
            LEFT JOIN tabelaBasica.tipoMovimentacao TM ON TM.codigo = LM.tipoMovimentacao
            LEFT JOIN configuracao.usuario U ON U.codigo = LM.usuarioCadastro
            LEFT JOIN cadastro.projetoContaVinculada C ON C.codigo = LM.contaVinculada
            LEFT JOIN tabelaBasica.banco B ON B.codigo = C.banco
            WHERE (1=1)
        `

        if (projeto && projeto !== '0' && projeto !== '') {
            request.input('projeto', parseInt(projeto))
            sql += ` AND LM.projeto = @projeto `
        }

        if (tipoMovimentacao && tipoMovimentacao !== '0' && tipoMovimentacao !== '') {
            request.input('tipoMovimentacao', parseInt(tipoMovimentacao))
            sql += ` AND LM.tipoMovimentacao = @tipoMovimentacao `
        }

        if (dataMovimentacao && dataMovimentacao.trim() !== '') {
            // Convert DD/MM/YYYY to YYYY-MM-DD for SQL comparison
            const [d, m, y] = dataMovimentacao.split('/')
            if (y && m && d) {
                request.input('dataMovimentacao', `${y}-${m}-${d}`)
                sql += ` AND LM.dataMovimentacao = @dataMovimentacao `
            }
        }

        sql += ` ORDER BY LM.codigo DESC `

        const result = await request.query(sql)

        return {
            status: 'success',
            results: result.recordset
        }

    } catch (error: any) {
        console.error('Erro na listagem de Lancamento Manual:', error)
        return { status: 'failed', mensagem: 'Erro na API de filtro: ' + error.message }
    }
})
