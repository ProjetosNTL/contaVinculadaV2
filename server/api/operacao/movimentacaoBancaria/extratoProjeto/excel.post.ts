import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'
import ExcelJS from 'exceljs' 

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const req = (await useDb()).request()

  const { projeto, tipo, dataInicial, dataFinal, agrupar, detalhar, ordenar, lancamento } = body
  const ord = ordenar == '0' ? 'ASC' : 'DESC'

  let where = ` WHERE E.projeto = @projeto `
  req.input('projeto', parseInt(projeto))

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
  if (agrupar == '0') {
    sql = `SELECT * FROM (SELECT E.codigo, F.nomeCompleto AS nomeFuncionario, E.valorMovimentacao, E.tipoMovimentacao, E.tipoLancamento, E.projeto, U.login AS usuarioCadastro, E.dataCadastro, LC.descricao AS detalhes,SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END) OVER (ORDER BY E.dataCadastro ASC, F.nomeCompleto ASC, E.codigo ASC ROWS UNBOUNDED PRECEDING) AS saldoAcumulado FROM operacao.extrato E LEFT JOIN cadastro.Funcionario F ON F.codigo = E.funcionario LEFT JOIN configuracao.usuario U ON U.codigo = E.usuarioCadastro LEFT JOIN tabelaBasica.lancamento LC ON LC.codigo = E.classificacaoContracheque ${where}) AS final ORDER BY final.dataCadastro ${ord}, final.nomeFuncionario ${ord}, final.codigo ${ord}`
  } else if (agrupar == '1' && detalhar == '0') {
    sql = `SELECT * FROM (SELECT MIN(E.codigo) AS codigo, MAX(E.codigo) AS ordemID, CASE WHEN MAX(E.classificacaoContracheque) IS NOT NULL THEN 'Contracheque' WHEN COUNT(E.codigo) > 1 THEN 'Lançamento Agrupado (' + CAST(COUNT(E.codigo) AS VARCHAR) + ' itens)' ELSE MAX(F.nomeCompleto) END AS nomeFuncionario,ABS(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END)) AS valorMovimentacao, CASE WHEN SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END) >= 0 THEN 1 ELSE 2 END AS tipoMovimentacao,MAX(E.tipoLancamento) AS tipoLancamento, E.projeto, U.login AS usuarioCadastro, CAST(E.dataCadastro AS DATE) AS dataCadastro,CASE WHEN MAX(E.classificacaoContracheque) IS NOT NULL THEN '' ELSE MAX(LC.descricao) END AS detalhes,SUM(SUM(CASE WHEN E.tipoMovimentacao = 1 THEN E.valorMovimentacao ELSE -E.valorMovimentacao END)) OVER (ORDER BY CAST(E.dataCadastro AS DATE) ASC, MIN(E.codigo) ASC ROWS UNBOUNDED PRECEDING) AS saldoAcumulado FROM operacao.extrato E LEFT JOIN cadastro.Funcionario F ON F.codigo = E.funcionario LEFT JOIN configuracao.usuario U ON U.codigo = E.usuarioCadastro LEFT JOIN tabelaBasica.lancamento LC ON LC.codigo = E.classificacaoContracheque ${where} GROUP BY CAST(E.dataCadastro AS DATE), E.projeto, U.login, CASE WHEN E.classificacaoContracheque IS NOT NULL THEN 1 ELSE 0 END) AS final ORDER BY final.dataCadastro ${ord}, final.ordemID ${ord}`
  } else {
    sql = `SELECT * FROM (SELECT MIN(E.codigo) AS codigo, CASE WHEN E.classificacaoContracheque IS NOT NULL THEN 'TOTAL ' + MAX(LC.descricao) WHEN COUNT(E.codigo) > 1 THEN 'Lançamento Agrupado (' + CAST(COUNT(E.codigo) AS VARCHAR) + ' itens)' ELSE MAX(F.nomeCompleto) END AS nomeFuncionario, SUM(E.valorMovimentacao) AS valorMovimentacao, E.tipoMovimentacao, E.tipoLancamento, E.projeto, U.login AS usuarioCadastro, E.dataCadastro, MAX(LC.descricao) AS detalhes,SUM(CASE WHEN E.tipoMovimentacao = 1 THEN SUM(E.valorMovimentacao) ELSE -SUM(E.valorMovimentacao) END) OVER (ORDER BY E.dataCadastro ASC, MIN(E.codigo) ASC ROWS UNBOUNDED PRECEDING) AS saldoAcumulado FROM operacao.extrato E LEFT JOIN cadastro.Funcionario F ON F.codigo = E.funcionario LEFT JOIN configuracao.usuario U ON U.codigo = E.usuarioCadastro LEFT JOIN tabelaBasica.lancamento LC ON LC.codigo = E.classificacaoContracheque ${where} GROUP BY E.dataCadastro, E.tipoLancamento, E.tipoMovimentacao, E.projeto, U.login, E.classificacaoContracheque) AS final ORDER BY final.dataCadastro ${ord}, final.nomeFuncionario ${ord}, final.codigo ${ord}`
  }

  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Extrato Projeto')

    const projReq = (await useDb()).request()
    const projData = await projReq.query(`SELECT descricao FROM cadastro.Projeto WHERE codigo = ${projeto}`)
    const nomeProjeto = projData.recordset[0]?.descricao || 'PROJETO'

    worksheet.mergeCells('A1:C1')
    worksheet.getCell('A1').value = 'EXTRATO FINANCEIRO'
    worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } }
    worksheet.getCell('A1').font = { color: { argb: 'FFFFFF' }, bold: true, size: 14 }
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.mergeCells('A2:C3')
    worksheet.getCell('A2').value = nomeProjeto.toUpperCase()
    worksheet.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } }
    worksheet.getCell('A2').font = { color: { argb: '1F4E78' }, bold: true, size: 16 }
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' }

    const result = await req.query(sql)
    let totalMovimentado = 0

    const cabecalhoLinha = 7
    worksheet.getRow(cabecalhoLinha).values = ['Funcionário', 'Usuário', 'Descrição', 'Data', 'Valor', 'Saldo']
    worksheet.getRow(cabecalhoLinha).font = { bold: true, color: { argb: 'FFFFFF' } }
    worksheet.getRow(cabecalhoLinha).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2F5597' } }

    let linhaAtual = 8

    result.recordset.forEach((row: any) => {
      let valor = Number(row.valorMovimentacao)
      if (row.tipoMovimentacao == 2) valor = -valor
      totalMovimentado += valor

      let dStr = ''
      if(row.dataCadastro) {
        const d = new Date(row.dataCadastro)
        dStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
      }

      let tipoDesc = 'Outro'
      if (row.tipoLancamento == 1) tipoDesc = 'Contracheque'
      else if (row.tipoLancamento == 2) tipoDesc = 'Lançamento manual'
      else if (row.tipoLancamento == 3) tipoDesc = 'Reembolso'
      else if (row.tipoLancamento == 4) tipoDesc = 'Estorno'

      worksheet.addRow([
        row.nomeFuncionario,
        row.usuarioCadastro,
        row.detalhes || tipoDesc,
        dStr,
        valor,
        Number(row.saldoAcumulado)
      ])

      worksheet.getCell(`E${linhaAtual}`).numFmt = '"R$" #,##0.00'
      worksheet.getCell(`F${linhaAtual}`).numFmt = '"R$" #,##0.00'
      linhaAtual++
    })

    worksheet.mergeCells('D1:F1')
    worksheet.getCell('D1').value = 'SALDO TOTAL'
    worksheet.getCell('D1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1F4E78' } }
    worksheet.getCell('D1').font = { color: { argb: 'FFFFFF' }, bold: true, size: 14 }
    worksheet.getCell('D1').alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.mergeCells('D2:F3')
    worksheet.getCell('D2').value = totalMovimentado
    worksheet.getCell('D2').numFmt = '"R$" #,##0.00'
    const corSaldo = totalMovimentado >= 0 ? '92D050' : 'FF7C80'
    worksheet.getCell('D2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: corSaldo } }
    worksheet.getCell('D2').font = { color: { argb: '1F4E78' }, bold: true, size: 20 }
    worksheet.getCell('D2').alignment = { vertical: 'middle', horizontal: 'center' }

    worksheet.columns.forEach(column => { column.width = 20 })
    worksheet.getColumn(1).width = 35 
    worksheet.getColumn(3).width = 40 

    const buffer = await workbook.xlsx.writeBuffer()
    
    event.node.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    event.node.res.setHeader('Content-Disposition', 'attachment; filename="extrato.xlsx"')
    
    return buffer

  } catch (error) {
    console.error('Erro Excel:', error)
    return { status: 'failed' }
  }
})