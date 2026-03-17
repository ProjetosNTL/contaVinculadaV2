import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const req = (await useDb()).request()

  let query = `
    SELECT P.codigo AS codigoProjeto, P.apelido AS apelido, P.descricao AS projeto, MAX(B.nomeBanco) AS nomeBanco, COALESCE(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END), 0) AS saldoProjeto FROM cadastro.projeto P
    LEFT JOIN operacao.extrato E ON E.projeto = P.codigo
    LEFT JOIN (SELECT projeto, MAX(codigo) AS contaVinculadaId FROM cadastro.projetoContaVinculada GROUP BY projeto) AS UC ON P.codigo = UC.projeto
    LEFT JOIN cadastro.projetoContaVinculada V ON V.codigo = UC.contaVinculadaId
    LEFT JOIN tabelaBasica.banco B ON B.codigo = V.banco 
    WHERE P.ativo = 1
    `

  if (body.projeto) {
    req.input('projeto', parseInt(body.projeto))
    query += ` AND P.codigo = @projeto `
  }
  if (body.contaVinculada) {
    req.input('conta', parseInt(body.contaVinculada))
    query += ` AND V.codigo = @conta `
  }

  query += ` GROUP BY P.codigo, P.apelido, P.descricao ORDER BY P.apelido ASC `

  try {
    const result = await req.query(query)
    return { status: 'success', data: result.recordset }
  } catch (erro) {
    console.error('Erro listagem saldo projetos:', erro)
    return { status: 'failed', mensagem: 'Erro ao buscar no banco de dados.' }
  }
})