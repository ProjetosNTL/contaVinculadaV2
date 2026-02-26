import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo)

  if (!codigo) {
    return { status: 'failed', message: 'Código não informado' }
  }

  const usuario = 1 

  try {
    const pool = await useDb()
    
    const selectQuery = `SELECT projeto, decimoTerceiro, feriasConstitucional as ferias, multaFgts, submodulo FROM configuracao.parametroFinanceiro WHERE codigo = ${codigo}`
    const resultQuery = await pool.request().query(selectQuery)

    if (resultQuery.recordset.length === 0) {
       return { status: 'failed', message: 'Registro não encontrado para exclusão.' }
    }

    const rec = resultQuery.recordset[0]
    
    const queryExec = `EXEC configuracao.ParametroFinanceiro_Atualiza ${codigo}, ${rec.projeto}, 0, ${rec.decimoTerceiro}, ${rec.ferias}, ${rec.multaFgts}, ${rec.submodulo}, ${usuario}, 0`
    await pool.request().query(queryExec)

    return { status: 'success', message: 'Registro excluído com sucesso.' }
  } catch (erro) {
    console.error('Erro ao excluir parâmetro financeiro:', erro)
    return { status: 'failed', message: 'Erro ao excluir no banco.' }
  }
})