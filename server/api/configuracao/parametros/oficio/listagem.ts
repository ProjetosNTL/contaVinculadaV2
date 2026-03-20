import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  let query = `
    SELECT PO.codigo, CP.apelido, CP.descricao as projeto, PO.saldoOficio FROM configuracao.parametroOficio PO
    LEFT JOIN cadastro.projeto CP ON CP.codigo = PO.projeto 
    WHERE PO.projeto IS NOT NULL
  `

  if (body.projetoNome) {
    query += ` AND CP.descricao LIKE '%${body.projetoNome}%'`
  }

  if (body.comSaldo !== undefined && body.comSaldo !== null && body.comSaldo !== '') {
    query += ` AND PO.saldoOficio = ${Number(body.comSaldo)}`
  }

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    return {
      status: 'success',
      data: result.recordset
    }
  } catch (erro) {
    console.error('Erro na listagem de ofícios:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco.' }
  }
})