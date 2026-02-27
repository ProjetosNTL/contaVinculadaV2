import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo) || 0
  const tipo = Number(body.tipo)
  const descricao = body.descricao ? `'${body.descricao.replace(/'/g, "''")}'` : 'NULL'
  const usuario = 1 

  const queryExec = `EXEC tabelaBasica.tipoMovimentacao_Atualiza ${codigo}, ${descricao}, ${tipo}, ${usuario}, 1`

  try {
    const pool = await useDb()
    await pool.request().query(queryExec)
    return { status: 'success', message: 'Operação realizada com sucesso.' }
  } catch (erro) {
    console.error('Erro ao gravar tipo de movimentação:', erro)
    return { status: 'failed', message: 'Erro ao gravar no banco de dados.' }
  }
})