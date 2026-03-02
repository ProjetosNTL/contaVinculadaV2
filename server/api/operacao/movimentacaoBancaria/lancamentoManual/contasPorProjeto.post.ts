import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const projeto = Number(body.projeto)

  if (!projeto) return []

  try {
    const pool = await useDb()
    const query = `
      SELECT CP.codigo, B.nomeBanco as banco, CP.conta FROM cadastro.projetoContaVinculada CP
      LEFT JOIN tabelaBasica.banco B ON B.codigo = CP.banco 
      WHERE CP.projeto = ${projeto} ORDER BY B.nomeBanco
    `
    const result = await pool.request().query(query)
    return result.recordset
  } catch (erro) {
    console.error('Erro ao buscar contas:', erro)
    return []
  }
})