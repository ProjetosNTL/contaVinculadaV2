import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = Number(body.lancamentoReembolso)

  try {
    const pool = await useDb()
    const query = `
      SELECT LR.motivo, U.login AS usuarioCadastro, LR.dataCadastro 
      FROM operacao.lancamentoReembolso LR
      LEFT JOIN configuracao.usuario U ON U.codigo = LR.usuarioCadastro
      WHERE LR.codigo = ${id}
    `
    const result = await pool.request().query(query)
    if (result.recordset.length > 0) {
      const row = result.recordset[0]
      if(row.dataCadastro) {
         const d = new Date(row.dataCadastro)
         row.dataCadastro = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      }
      return row
    }
    return { motivo: '', usuarioCadastro: '', dataCadastro: '' }
  } catch (erro) {
    return { motivo: '', usuarioCadastro: '', dataCadastro: '' }
  }
})