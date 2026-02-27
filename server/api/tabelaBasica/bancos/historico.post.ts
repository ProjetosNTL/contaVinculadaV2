import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const bancoId = Number(body.banco)

  if (!bancoId) return { status: 'failed', message: 'Banco não informado' }

  try {
    const pool = await useDb()
    
    const mockHistorico = [
      {
        codigo: 2221,
        dataAlteracao: '27/02/2026 09:00',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- O banco foi ativado.'
        ]
      }
    ]

    return { status: 'success', data: mockHistorico }
  } catch (erro) {
    console.error('Erro ao recuperar o histórico do banco:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})