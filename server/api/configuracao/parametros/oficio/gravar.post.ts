import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let codigo = Number(body.codigo) || 0
  const projeto = Number(body.projeto)
  let texto = body.texto

  texto = texto.replace(/'/g, "''")

  const usuarioLogado = 1 

  try {
    const pool = await useDb()

    const queryVerifica = `SELECT codigo FROM configuracao.parametroOficio WHERE projeto = ${projeto} AND projeto IS NOT NULL`
    const resultVerifica = await pool.request().query(queryVerifica)
    
    if (resultVerifica.recordset.length > 0) {
      codigo = resultVerifica.recordset[0].codigo
    }

    const querySaldo = `SELECT saldoOficio FROM cadastro.projeto WHERE codigo = ${projeto}`
    const resultSaldo = await pool.request().query(querySaldo)
    
    let saldoOficio = 0
    if (resultSaldo.recordset.length > 0 && resultSaldo.recordset[0].saldoOficio == 1) {
      saldoOficio = 1
    }

    // Grava via Procedure
    const queryExec = `EXEC configuracao.parametroOficio_Atualiza ${codigo}, ${projeto}, NULL, ${saldoOficio}, '${texto}', ${usuarioLogado}`
    await pool.request().query(queryExec)

    return { status: 'success', message: 'Operação realizada com sucesso.' }
  } catch (erro) {
    console.error('Erro ao gravar ofício:', erro)
    return { status: 'failed', message: 'Erro ao gravar no banco.' }
  }
})