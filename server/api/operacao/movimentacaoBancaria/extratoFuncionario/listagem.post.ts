import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const req = (await useDb()).request()

  let query = `
    SELECT F.codigo AS codigoFuncionario, F.nomeCompleto, F.cpf, P.apelido, P.descricao AS projeto, 
    COALESCE(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END), 0) AS saldo FROM cadastro.Funcionario F 
    LEFT JOIN operacao.extrato E ON E.funcionario = F.codigo
    LEFT JOIN cadastro.projeto P ON F.projeto = P.codigo 
    WHERE 1=1 
    `

  if (body.funcionarioId) {
    req.input('funcId', parseInt(body.funcionarioId))
    query += ` AND F.codigo = @funcId `
  }
  if (body.projeto) {
    req.input('projeto', parseInt(body.projeto))
    query += ` AND P.codigo = @projeto `
  }

  query += ` GROUP BY F.codigo, F.nomeCompleto, F.cpf, P.apelido, P.descricao ORDER BY F.nomeCompleto ASC `

  try {
    const result = await req.query(query)
    return { status: 'success', data: result.recordset }
  } catch (erro) {
    console.error('Erro listagem saldo funcionário:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco de dados.' }
  }
})