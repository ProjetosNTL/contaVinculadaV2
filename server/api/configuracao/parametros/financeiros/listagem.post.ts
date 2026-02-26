import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  let query = `
    SELECT 
      PF.codigo, 
      CP.apelido, 
      CP.descricao as projeto, 
      PF.decimoTerceiro, 
      PF.feriasConstitucional, 
      PF.multaFgts, 
      PF.submodulo, 
      PF.ativo 
    FROM configuracao.parametroFinanceiro PF
    LEFT JOIN cadastro.projeto CP ON CP.codigo = PF.projeto 
    WHERE (0 = 0)
  `

  if (body.projetoNome) {
    query += ` AND CP.descricao LIKE '%${body.projetoNome}%'`
  }

  if (body.ativo && body.ativo !== '') {
    query += ` AND PF.ativo = ${Number(body.ativo)}`
  }

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    return {
      status: 'success',
      data: result.recordset
    }
  } catch (erro) {
    console.error('Erro ao listar parâmetros financeiros:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco.' }
  }
})