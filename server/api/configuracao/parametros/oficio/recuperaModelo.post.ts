import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const tipoSaldo = Number(body.tipoSaldo)

  try {
    const pool = await useDb()
    const query = `SELECT redacaoPadrao FROM configuracao.parametroOficio WHERE projeto IS NULL AND saldoOficio = ${tipoSaldo}`
    
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) {
      return { status: 'success', data: result.recordset[0].redacaoPadrao }
    } else {
      return { status: 'success', data: '' }
    }
  } catch (erro) {
    console.error('Erro ao recuperar padrão:', erro)
    return { status: 'failed', message: 'Erro ao conectar no banco' }
  }
})