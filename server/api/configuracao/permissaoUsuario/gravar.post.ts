import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const usuarioId = body.usuarioId
  const menuItem = body.menuItem
  const permissoes = body.permissoes || []

  if (!usuarioId || !menuItem) {
    return { status: 'failed', message: 'Usuário ou menu não informados' }
  }

  const marcadas = permissoes.map((p: any) => p.idFuncionalidade || p.codigo)

  try {
    const pool = await useDb() 
    
    const queryAtuais = `SELECT funcionalidade, ativo FROM configuracao.usuarioFuncionalidade WHERE usuario = ${Number(usuarioId)} AND menuItem = ${Number(menuItem)}`
    const atuais = await pool.request().query(queryAtuais)
    
    const queryMenu = `SELECT codigo FROM configuracao.funcionalidade WHERE menuItem = ${Number(menuItem)} AND ativo = 1`
    const todasMenu = await pool.request().query(queryMenu)

    const usuarioLogado = 1 

    for (const func of todasMenu.recordset) {
      const codigoFunc = func.codigo
      const ativoNovo = marcadas.includes(codigoFunc) ? 1 : 0
      const ativoBanco = atuais.recordset.find((a: any) => a.funcionalidade === codigoFunc)?.ativo || 0
      
      if (ativoNovo !== ativoBanco) {
         const queryExec = `EXEC configuracao.usuarioFuncionalidade_Atualiza 0, ${Number(usuarioId)}, ${Number(menuItem)}, ${codigoFunc}, ${ativoNovo}, ${usuarioLogado}`
         await pool.request().query(queryExec)
      }
    }

    return {
      status: 'success',
      message: 'Permissões gravadas com sucesso!'
    }
  } catch (erro) {
    console.error('Erro ao gravar as permissões:', erro)
    return { status: 'failed', message: 'Deu erro ao gravar no banco.' }
  }
})