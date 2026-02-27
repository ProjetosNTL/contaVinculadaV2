import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const tipoMovimentacaoId = Number(body.tipoMovimentacao)

  if (!tipoMovimentacaoId) return { status: 'failed', message: 'Tipo de movimentação não informado' }

  try {
    const pool = await useDb()
    
    const mockHistorico = [
      {
        codigo: 3331,
        dataAlteracao: '27/02/2026 10:30',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- O tipo movimentação foi ativado.',
          '- O campo Tipo de movimentação bancária foi alterado de: <span style="color:#cc0000">Débito</span> para: <span style="color:green"> Crédito</span>'
        ]
      }
    ]

    return { status: 'success', data: mockHistorico }
  } catch (erro) {
    console.error('Erro ao recuperar o histórico:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})