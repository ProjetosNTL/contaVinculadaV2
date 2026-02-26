import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parametroFinanceiro = Number(body.parametroFinanceiro)

  if (!parametroFinanceiro) {
    return { status: 'failed', message: 'Parâmetro financeiro não informado' }
  }

  try {
    const pool = await useDb()

    const mockHistorico = [
      {
        codigo: 7771,
        dataAlteracao: '26/02/2026 10:45',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- O campo do Décimo Terceiro foi alterado de: <span style="color:#cc0000">10%</span> para: <span style="color:green"> 15%</span>'
        ]
      }
    ]

    return {
      status: 'success',
      data: mockHistorico
    }
  } catch (erro) {
    console.error('Erro ao recuperar o histórico financeiro:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})