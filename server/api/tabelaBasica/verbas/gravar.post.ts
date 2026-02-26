import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  const codigo = Number(body.codigo) || 0
  const codigoReferencia = Number(body.codigoReferencia)
  const descricao = body.descricao
  const tipo = Number(body.tipo)
  const observacao = body.observacao

  const usuario = 1 

  const descSql = descricao ? `'${descricao.replace(/'/g, "''")}'` : 'NULL'
  const obsSql = observacao ? `'${observacao.replace(/'/g, "''")}'` : 'NULL'

  const queryExec = `EXEC cadastro.verba_Atualiza ${codigo}, ${codigoReferencia}, ${descSql}, ${tipo}, ${obsSql}, ${usuario}, 1`

  try {
    const pool = await useDb()
    await pool.request().query(queryExec)

    return { status: 'success', message: 'Operação realizada com sucesso.' }
  } catch (erro) {
    console.error('Erro ao gravar verba:', erro)
    return { status: 'failed', message: 'Erro ao gravar no banco de dados.' }
  }
})