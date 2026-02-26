import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigo = Number(body.codigo) || 0
  const projeto = Number(body.projeto)
  const diaPagamento = Number(body.diaPagamento)
  
  // Substitui vírgulas por pontos se vier no formato BR
  const decimo = Number(String(body.decimoTerceiro).replace(',', '.')) || 0
  const ferias = Number(String(body.ferias).replace(',', '.')) || 0
  const multa = Number(String(body.multaFgts).replace(',', '.')) || 0
  const submodulo = Number(String(body.submodulo).replace(',', '.')) || 0

  const usuario = 1

  try {
    const pool = await useDb()

    if (codigo === 0) {
      const verificaQuery = `SELECT codigo FROM configuracao.parametroFinanceiro WHERE projeto = ${projeto} AND ativo = 1`
      const verificaResult = await pool.request().query(verificaQuery)
      
      if (verificaResult.recordset.length > 0) {
        return { status: 'failed', message: 'Projeto com parâmetros já cadastrado.' }
      }
    }

    const queryExec = `EXEC configuracao.ParametroFinanceiro_Atualiza ${codigo}, ${projeto}, ${diaPagamento}, ${decimo}, ${ferias}, ${multa}, ${submodulo}, ${usuario}, 1`
    await pool.request().query(queryExec)

    return { status: 'success', message: 'Operação realizada com sucesso.' }
  } catch (erro) {
    console.error('Erro ao gravar parâmetro financeiro:', erro)
    return { status: 'failed', message: 'Erro ao gravar no banco.' }
  }
})