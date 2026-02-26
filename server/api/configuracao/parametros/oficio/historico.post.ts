import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parametroOficio = body.parametroOficio

  if (!parametroOficio) {
    return { status: 'failed', message: 'Ofício não informado' }
  }

  try {
    const pool = await useDb()

    const mockHistorico = [
      {
        codigo: 8881,
        dataAlteracao: '26/02/2026 09:15',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- O ofício com Saldo.',
          '- O campo da Redação Ofício foi alterado.'
        ]
      }
    ]

    return {
      status: 'success',
      data: mockHistorico
    }
  } catch (erro) {
    console.error('Erro ao puxar o histórico:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})