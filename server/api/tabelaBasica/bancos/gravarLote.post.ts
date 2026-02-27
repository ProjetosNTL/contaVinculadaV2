import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const bancos = body.bancos || []
  const usuario = 1 

  if (bancos.length === 0) return { status: 'failed', message: 'Nenhum banco recebido' }

  try {
    const pool = await useDb()
    
    for (const banco of bancos) {
      const codBanco = Number(banco.codigoBanco)
      const nome = banco.nomeBanco ? `'${banco.nomeBanco.replace(/'/g, "''")}'` : 'NULL'
      
      const queryExec = `EXEC tabelaBasica.banco_Atualiza 0, ${codBanco}, ${nome}, ${usuario}, 1`
      await pool.request().query(queryExec)
    }

    return { status: 'success', message: 'Bancos importados com sucesso.' }
  } catch (erro) {
    console.error('Erro ao importar bancos em lote:', erro)
    return { status: 'failed', message: 'Erro ao gravar lote no banco de dados.' }
  }
})