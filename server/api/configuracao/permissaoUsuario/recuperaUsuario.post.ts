import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body.id

  if (!id) {
    return { status: 'failed', message: 'ID não informado na requisição' }
  }

  const query = `SELECT codigo, login FROM configuracao.usuario WHERE codigo = ${Number(id)}`

  try {
    const pool = await useDb() 
    const result = await pool.request().query(query)

    return {
      status: 'success',
      data: result.recordset[0] 
    }
  } catch (erro) {
    console.error('Erro ao recuperar o usuário:', erro)
    return { status: 'failed' }
  }
})