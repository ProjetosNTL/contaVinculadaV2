import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const tipoSaldo = Number(body.tipoSaldo)
  const texto = body.texto ? `'${body.texto.replace(/'/g, "''")}'` : 'NULL'
  const usuario = 1

  try {
    const pool = await useDb()
    
    const buscaQuery = `SELECT codigo FROM configuracao.parametroOficio WHERE projeto IS NULL AND saldoOficio = ${tipoSaldo}`
    const resultBusca = await pool.request().query(buscaQuery)
    
    let codigo = 0
    if (resultBusca.recordset.length > 0) {
        codigo = resultBusca.recordset[0].codigo
    }

    const queryExec = `
        EXEC configuracao.ParametroOficio_Atualiza 
        ${codigo}, 
        NULL, 
        ${texto}, 
        ${tipoSaldo}, 
        NULL, 
        ${usuario}
        `
    await pool.request().query(queryExec)

    return { status: 'success', mensagem: 'Gravado com sucesso!' }
  } catch (erro) {
    console.error('Erro ao gravar padrao:', erro)
    return { status: 'failed', mensagem: 'Erro ao gravar no banco.' }
  }
})