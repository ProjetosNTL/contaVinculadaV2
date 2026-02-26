import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const projeto = body.projeto

  if (!projeto) {
    return { status: 'failed', message: 'Projeto não informado' }
  }

  try {
    const pool = await useDb()
    
    const queryOficio = `SELECT saldoOficio FROM cadastro.projeto WHERE codigo = ${Number(projeto)}`
    const resultOficio = await pool.request().query(queryOficio)
    
    let saldoOficio = 0
    if (resultOficio.recordset.length > 0 && resultOficio.recordset[0].saldoOficio == 1) {
      saldoOficio = 1
    }

    const queryPadrao = `SELECT redacaoPadrao FROM configuracao.parametroOficio WHERE projeto IS NULL AND saldoOficio = ${saldoOficio}`
    const resultPadrao = await pool.request().query(queryPadrao)

    if (resultPadrao.recordset.length > 0) {
      return {
        status: 'success',
        data: { texto: resultPadrao.recordset[0].redacaoPadrao }
      }
    } else {
      return { status: 'failed', message: 'Modelo padrão não encontrado.' }
    }
  } catch (erro) {
    console.error('Erro ao buscar modelo padrão:', erro)
    return { status: 'failed', message: 'Erro ao conectar no banco' }
  }
})