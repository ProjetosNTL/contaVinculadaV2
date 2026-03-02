import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const conta = Number(body.conta)

  if (!conta) return { projeto: null }

  try {
    const pool = await useDb()
    const query = `SELECT projeto FROM cadastro.projetoContaVinculada WHERE codigo = ${conta}`
    const result = await pool.request().query(query)
    
    if (result.recordset.length > 0) return { projeto: result.recordset[0].projeto }
    return { projeto: null }
  } catch (erro) {
    console.error('Erro ao buscar projeto:', erro)
    return { projeto: null }
  }
})