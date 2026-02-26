import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = body.id

  if (!id || id === '0') {
    return { status: 'failed', message: 'ID inválido' }
  }

  const query = `SELECT codigo, projeto, redacaoOficio, saldoOficio FROM configuracao.parametroOficio WHERE codigo = ${Number(id)}`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) {
      const data = result.recordset[0]
      return {
        status: 'success',
        data: {
          codigo: data.codigo,
          projeto: data.projeto,
          texto: data.redacaoOficio,
          saldoOficio: data.saldoOficio == 1 ? 'comSaldo' : 'semSaldo'
        }
      }
    }
    
    return { status: 'failed', message: 'Ofício não encontrado' }
  } catch (erro) {
    console.error('Erro ao recuperar o ofício:', erro)
    return { status: 'failed' }
  }
})