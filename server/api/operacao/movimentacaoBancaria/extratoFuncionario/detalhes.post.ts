import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const req = (await useDb()).request()

  const { funcionario, tipo, dataInicial, dataFinal, detalhar, ordenar, lancamento } = body
  const ord = ordenar == '0' ? 'ASC' : 'DESC'

  let where = ` WHERE (E.funcionario = @funcionario OR (E.funcionario IS NULL AND E.projeto = (SELECT projeto FROM cadastro.Funcionario WHERE codigo = @funcionario))) `
  req.input('funcionario', parseInt(funcionario))

  if (tipo == 1) where += ` AND E.tipoMovimentacao = 1 `
  else if (tipo == 2) where += ` AND E.tipoMovimentacao = 2 `

  if (lancamento) {
    req.input('lancamento', parseInt(lancamento))
    if (['1', '2', '3', '4'].includes(String(lancamento))) {
      where += ` AND E.tipoLancamento = @lancamento `
    } else {
      where += ` AND E.classificacaoContracheque = @lancamento `
    }
  }

  if (dataInicial && dataFinal) {
    req.input('dtIn', dataInicial.split('/').reverse().join('-'))
    req.input('dtFi', dataFinal.split('/').reverse().join('-'))
    where += ` AND E.dataCadastro >= @dtIn AND E.dataCadastro < DATEADD(day, 1, @dtFi) `
  }

  let sql = ''

  if (detalhar == '0') {
    sql = `SELECT * FROM (SELECT MIN(E.codigo) AS codigo,MAX(F.nomeCompleto) AS nomeFuncionario,MAX(F.cpf) AS cpf,MAX(P.descricao) AS nomeProjeto,MAX(LT.descricao) AS tipoLancamentoDescBD,ABS(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END)) AS valorMovimentacao,CASE WHEN SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END) >= 0 THEN 1 ELSE 2 END AS tipoMovimentacao,CASE WHEN MAX(E.classificacaoContracheque) IS NOT NULL THEN 'Contracheque' ELSE MAX(LT.descricao) END AS detalhes,U.login AS usuarioCadastro,CAST(E.dataCadastro AS DATE) AS dataCadastro,E.tipoLancamento,SUM(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END)) OVER (ORDER BY CAST(E.dataCadastro AS DATE) ASC, MIN(E.codigo) ASC ROWS UNBOUNDED PRECEDING) AS saldoAcumulado FROM operacao.extrato E LEFT JOIN configuracao.usuario U ON U.codigo = E.usuarioCadastro LEFT JOIN cadastro.Funcionario F ON F.codigo = E.funcionario LEFT JOIN cadastro.Projeto P ON P.codigo = F.projeto LEFT JOIN tabelaBasica.lancamento LT ON LT.codigo = E.tipoLancamento ${where} GROUP BY CAST(E.dataCadastro AS DATE), U.login, CASE WHEN E.classificacaoContracheque IS NOT NULL THEN 1 ELSE 0 END, E.tipoLancamento) AS final ORDER BY final.dataCadastro ${ord}, final.codigo ${ord}`
  } else {
    sql = `SELECT * FROM (SELECT MIN(E.codigo) AS codigo, MAX(F.nomeCompleto) AS nomeFuncionario,MAX(F.cpf) AS cpf,MAX(P.descricao) AS nomeProjeto,MAX(LT.descricao) AS tipoLancamentoDescBD,SUM(E.valorMovimentacao) AS valorMovimentacao, E.tipoMovimentacao, U.login AS usuarioCadastro, CAST(E.dataCadastro AS DATE) AS dataCadastro, E.tipoLancamento, MAX(LC.descricao) AS detalhes, SUM(CASE WHEN E.tipoMovimentacao = 1 THEN SUM(E.valorMovimentacao) ELSE -SUM(E.valorMovimentacao) END) OVER (ORDER BY CAST(E.dataCadastro AS DATE) ASC, MIN(E.codigo) ASC ROWS UNBOUNDED PRECEDING) AS saldoAcumulado FROM operacao.extrato E LEFT JOIN configuracao.usuario U ON U.codigo = E.usuarioCadastro LEFT JOIN cadastro.Funcionario F ON F.codigo = E.funcionario LEFT JOIN cadastro.Projeto P ON P.codigo = F.projeto LEFT JOIN tabelaBasica.lancamento LC ON LC.codigo = E.classificacaoContracheque LEFT JOIN tabelaBasica.lancamento LT ON LT.codigo = E.tipoLancamento ${where} GROUP BY CAST(E.dataCadastro AS DATE), E.tipoLancamento, E.tipoMovimentacao, U.login, E.classificacaoContracheque) AS final ORDER BY final.dataCadastro ${ord}, final.codigo ${ord}`
  }

  try {
    const result = await req.query(sql)
    
    const dataFormatada = result.recordset.map((row: any) => {
      if(row.dataCadastro){
        const d = new Date(row.dataCadastro)
        row.dataCadastroFormatada = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
      }
      
      let tipoDesc = 'Outro'
      if (row.tipoLancamento == 1) tipoDesc = 'Contracheque'
      else if (row.tipoLancamento == 2) tipoDesc = 'Lançamento manual'
      else if (row.tipoLancamento == 3) tipoDesc = 'Reembolso'
      else if (row.tipoLancamento == 4) tipoDesc = 'Estorno'
      
      row.tipoLancamentoDesc = tipoDesc
      return row
    })

    return { status: 'success', data: dataFormatada }
  } catch (erro) {
    console.error('Erro detalhes extrato func:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco de dados.' }
  }
})