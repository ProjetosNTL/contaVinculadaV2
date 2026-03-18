import { useDb } from '../../utils/db'

export default defineEventHandler(async () => {
  const db = await useDb()

  try {
    const result = await db.request().query(`
      SELECT TOP 5
        E.tipoLancamento,
        F.nomeCompleto as funcionario,
        P.apelido as projeto,
        E.valorMovimentacao as valor,
        E.tipoMovimentacao,
        E.dataCadastro
      FROM operacao.extrato E WITH(NOLOCK)
      LEFT JOIN cadastro.Funcionario F ON F.codigo = E.funcionario
      LEFT JOIN cadastro.projeto P ON P.codigo = E.projeto
      ORDER BY E.dataCadastro DESC
    `)

    return {
      status: 'success',
      data: result.recordset || []
    }
  } catch (error: any) {
    console.error('Erro atividades dashboard:', error.message)
    return { status: 'failed', data: [] }
  }
})
