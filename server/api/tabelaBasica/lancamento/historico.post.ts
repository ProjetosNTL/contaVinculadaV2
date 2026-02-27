import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const lancamentoId = Number(body.lancamento) 

  if (!lancamentoId) return { status: 'failed', message: 'Lançamento não informado' }

  try {
    const pool = await useDb()
    
    const mockHistorico = [
      {
        codigo: 888,
        dataAlteracao: '28/02/2026 14:20',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- Lançamento foi ativado.',
          '- O campo Descrição do Lançamento foi alterado de: <span style="color:#cc0000">Despesa</span> para: <span style="color:green"> Receita</span>'
        ]
      }
    ]

    return { status: 'success', data: mockHistorico }
  } catch (erro) {
    console.error('Erro ao recuperar o histórico do lançamento:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})