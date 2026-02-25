import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db' // ajustei a importação

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  let query = `
    SELECT U.codigo, U.login, U.nomeUsuario, U.cpf FROM configuracao.usuario U 
    WHERE ISNULL(U.tipoUsuario, '') <> 'S'
  `

  if (body.loginId) query += ` AND U.codigo = ${Number(body.loginId)}`
  if (body.usuarioId) query += ` AND U.codigo = ${Number(body.usuarioId)}`
  if (body.cpf) {
    const cpfLimpo = body.cpf.replace(/\D/g, '')
    query += ` AND U.cpf = '${cpfLimpo}'`
  }

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    return {
      status: 'success',
      data: result.recordset
    }
  } catch (erro) {
    console.error('Erro na listagem:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco.' }
  }
})