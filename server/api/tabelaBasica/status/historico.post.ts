import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const statusId = Number(body.status)

  if (!statusId) return { status: 'failed', message: 'Status não informado' }

  try {
    const pool = await useDb()
    
    const mockHistorico = [
      {
        codigo: 888,
        dataAlteracao: '28/02/2026 11:15',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- Status foi ativado.',
          '- O campo Descrição do Status foi alterado de: <span style="color:#cc0000">Pendente</span> para: <span style="color:green"> Concluído</span>'
        ]
      }
    ]

    return { status: 'success', data: mockHistorico }
  } catch (erro) {
    console.error('Erro ao recuperar o histórico do status:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})