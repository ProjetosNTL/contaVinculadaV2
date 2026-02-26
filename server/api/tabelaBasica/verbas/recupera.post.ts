import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = Number(body.id)

  if (!id) {
    return { status: 'failed', message: 'ID inválido' }
  }

  const query = `
    SELECT codigo, codigoReferencia, descricao, tipo, observacao, ativo FROM cadastro.verbas 
    WHERE codigo = ${id}
  `

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) {
      return { status: 'success', data: result.recordset[0] }
    }
    
    return { status: 'failed', message: 'Registro não encontrado' }
  } catch (erro) {
    console.error('Erro ao recuperar verba:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco de dados.' }
  }
})