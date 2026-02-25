import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const { projeto, tipoMovimentacao, dataMovimentacao } = body

    try {
        const request = db.request()

        let sql = `
            SELECT DISTINCT 
                LR.codigo,
                P.descricao AS projeto,
                TM.descricao AS tipoMovimentacao,
                LR.dataMovimentacao,
                LR.valorMovimentacao,
                LR.dataCadastro,
                U.login AS usuarioCadastro,
                CONCAT(C.agencia,'/',C.conta,' - ',B.nomeBanco) AS contaVinculada, 
                CASE WHEN EXISTS(
                    SELECT codigo FROM operacao.lancamentoReembolsoFuncionario WHERE lancamentoReembolso = LR.codigo
                ) THEN 1 ELSE 0 END AS funcionario,
                LR.dataOficio,
                LR.valorOficio,
                LR.dataResposta,
                LR.dataEntrada,
                S.descricao AS status,
                LR.motivo
            FROM operacao.lancamentoReembolso LR
            LEFT JOIN cadastro.projeto P ON P.codigo = LR.projeto
            LEFT JOIN tabelaBasica.tipoMovimentacao TM ON TM.codigo = LR.tipoMovimentacao
            LEFT JOIN configuracao.usuario U ON U.codigo = LR.usuarioCadastro
            LEFT JOIN cadastro.projetoContaVinculada C ON C.codigo = LR.contaVinculada
            LEFT JOIN tabelaBasica.banco B ON B.codigo = C.banco
            LEFT JOIN tabelaBasica.status S ON S.codigo = LR.status
            WHERE (1=1)
        `

        if (projeto && projeto !== '0' && projeto !== '') {
            request.input('projeto', parseInt(projeto))
            sql += ` AND LR.projeto = @projeto `
        }

        if (tipoMovimentacao && tipoMovimentacao !== '0' && tipoMovimentacao !== '') {
            request.input('tipoMovimentacao', parseInt(tipoMovimentacao))
            sql += ` AND LR.tipoMovimentacao = @tipoMovimentacao `
        }

        if (dataMovimentacao && dataMovimentacao.trim() !== '') {
            const [d, m, y] = dataMovimentacao.split('/')
            if (y && m && d) {
                request.input('dataMovimentacao', `${y}-${m}-${d}`)
                sql += ` AND LR.dataMovimentacao = @dataMovimentacao `
            }
        }

        sql += ` ORDER BY LR.codigo DESC `

        const result = await request.query(sql)

        return {
            status: 'success',
            results: result.recordset
        }

    } catch (error: any) {
        console.error('Erro na listagem de Lancamento Reembolso:', error)
        return { status: 'failed', mensagem: 'Erro na API de filtro: ' + error.message }
    }
})
