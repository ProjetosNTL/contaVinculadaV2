import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = Number(body.lancamentoManual)

  try {
    const pool = await useDb()
    const query = `
      SELECT LM.motivo, U.login AS usuarioCadastro, LM.dataCadastro FROM operacao.lancamentoManual LM
      LEFT JOIN configuracao.usuario U ON U.codigo = LM.usuarioCadastro
      WHERE LM.codigo = ${id}
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
    console.error('Erro ao buscar detalhe:', erro)
    return { motivo: '', usuarioCadastro: '', dataCadastro: '' }
  }
})