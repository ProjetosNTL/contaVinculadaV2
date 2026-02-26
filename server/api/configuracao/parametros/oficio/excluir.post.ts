import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) {
    return { status: 'failed', message: 'Código não informado' }
  }

  try {
    const pool = await useDb()
    
    // Como não tem coluna "ativo", deletamos o registro de fato
    const query = `DELETE FROM configuracao.parametroOficio WHERE codigo = ${codigo}`
    await pool.request().query(query)

    return { status: 'success', message: 'Registro excluído com sucesso.' }
  } catch (erro) {
    console.error('Erro ao excluir ofício:', erro)
    return { status: 'failed', message: 'Erro ao excluir no banco.' }
  }
})