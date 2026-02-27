import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  let query = `
    SELECT codigo, descricao, ativo FROM tabelaBasica.classificacao 
    WHERE (0 = 0)
  `

  if (body.descricao) query += ` AND descricao LIKE '%${body.descricao}%'`
  if (body.ativo && body.ativo !== '') query += ` AND ativo = ${Number(body.ativo)}`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    return { status: 'success', data: result.recordset }
  } catch (erro) {
    console.error('Erro ao listar classificações:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco de dados.' }
  }
})