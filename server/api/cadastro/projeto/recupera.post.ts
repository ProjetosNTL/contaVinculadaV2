import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const id = Number(body.id)

  if (!id) return { status: 'failed', message: 'ID inválido' }

  const query = `SELECT * FROM cadastro.projeto WHERE codigo = ${id}`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    if (result.recordset.length > 0) {
      const p = result.recordset[0]
      return { 
        status: 'success', 
        data: {
          ...p,
          dataAssinatura: p.dataAssinatura ? new Date(p.dataAssinatura).toISOString().split('T')[0] : '',
          dataContaVinculada: p.dataContaVinculada ? new Date(p.dataContaVinculada).toISOString().split('T')[0] : ''
        }
      }
    }
    return { status: 'failed', message: 'Projeto não encontrado' }
  } catch (erro) {
    console.error('Erro ao recuperar projeto:', erro)
    return { status: 'failed', message: 'Erro ao buscar projeto no banco.' }
  }
})