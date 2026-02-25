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

  if (marcadas.length === 0) {
    return { status: 'failed', message: 'Nenhuma permissão selecionada para exclusão.' }
  }

  try {
    const pool = await useDb() 
    
    const queryAtuais = `SELECT codigo, funcionalidade, ativo FROM configuracao.usuarioFuncionalidade WHERE usuario = ${Number(usuarioId)} AND menuItem = ${Number(menuItem)}`
    const atuais = await pool.request().query(queryAtuais)
    
    const queryMenu = `SELECT codigo FROM configuracao.funcionalidade WHERE menuItem = ${Number(menuItem)} AND ativo = 1`
    const todasMenu = await pool.request().query(queryMenu)

    const usuarioLogado = 1 

    for (const func of todasMenu.recordset) {
      const codigoFunc = func.codigo
      const infoBanco = atuais.recordset.find((a: any) => a.funcionalidade === codigoFunc)
      const ativoBanco = infoBanco?.ativo || 0
      const codigoRegistro = infoBanco?.codigo || 0
      
      if (marcadas.includes(codigoFunc) && ativoBanco !== 0) {
         const queryExec = `EXEC configuracao.usuarioFuncionalidade_Atualiza ${codigoRegistro}, ${Number(usuarioId)}, ${Number(menuItem)}, ${codigoFunc}, 0, ${usuarioLogado}`
         await pool.request().query(queryExec)
      }
    }

    return {
      status: 'success',
      message: 'Permissões excluídas com sucesso.'
    }
  } catch (erro) {
    console.error('Erro na exclusão de permissões:', erro)
    return { status: 'failed', message: 'Erro ao excluir no banco.' }
  }
})