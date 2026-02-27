import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo) || 0
  const descricao = body.descricao ? `'${body.descricao.replace(/'/g, "''")}'` : 'NULL'
  const usuario = 1 

  const queryExec = `EXEC tabelaBasica.status_Atualiza ${codigo}, ${descricao}, ${usuario}, 1`

  try {
    const pool = await useDb()
    await pool.request().query(queryExec)
    return { status: 'success', message: 'Operação realizada com sucesso.' }
  } catch (erro) {
    console.error('Erro ao gravar status:', erro)
    return { status: 'failed', message: 'Erro ao gravar no banco de dados.' }
  }
})