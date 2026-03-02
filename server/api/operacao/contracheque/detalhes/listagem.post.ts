import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  let query = `
    SELECT DISTINCT C.codigo, F.nomeCompleto AS funcionario, C.cpf, P.descricao AS projeto, 
    C.mesAno, C.statusAprovacao, D.dataRetencao FROM operacao.baseContracheque C
    LEFT JOIN operacao.baseContrachequeDetalhes D ON C.codigo = D.codigoContracheque
    LEFT JOIN cadastro.projeto P ON P.codigo = C.projeto
    LEFT JOIN cadastro.Funcionario F ON F.cpf = C.cpf
    WHERE D.dataRetencao IS NOT NULL
    `

  if (body.mesAno) {
    const [mes, ano] = body.mesAno.split('/')
    query += ` AND C.mesAno = '${ano}-${mes}-01'`
  }

  if (body.funcionarioId) query += ` AND C.funcionario = ${Number(body.funcionarioId)}`
  if (body.projeto) query += ` AND C.projeto = ${Number(body.projeto)}`
  if (body.status && body.status !== '') query += ` AND C.statusAprovacao = ${Number(body.status)}`

  query += ` ORDER BY F.nomeCompleto ASC`

  try {
    const pool = await useDb()
    const result = await pool.request().query(query)

    const dataFormatada = result.recordset.map(row => {
      if(row.dataRetencao){
        const d = new Date(row.dataRetencao)
        row.dataRetencao = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
      } else {
        row.dataRetencao = ''
      }
      return row
    })

    return { status: 'success', data: dataFormatada }
  } catch (erro) {
    console.error('Erro ao listar detalhes do contracheque:', erro)
    return { status: 'failed', message: 'Erro ao buscar no banco de dados.' }
  }
})