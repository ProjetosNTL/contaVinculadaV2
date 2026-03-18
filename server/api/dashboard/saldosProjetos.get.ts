import { useDb } from '../../utils/db'

export default defineEventHandler(async () => {
  const db = await useDb()

  try {
    const result = await db.request().query(`
      SELECT TOP 5
        P.apelido as projeto,
        COALESCE(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END), 0) AS saldo
      FROM cadastro.projeto P WITH(NOLOCK)
      LEFT JOIN operacao.extrato E ON E.projeto = P.codigo
      WHERE P.ativo = 1
      GROUP BY P.codigo, P.apelido
      ORDER BY saldo DESC, P.apelido ASC
    `)

    return {
      status: 'success',
      data: result.recordset || []
    }
  } catch (error: any) {
    return { status: 'failed', data: [] }
  }
})
