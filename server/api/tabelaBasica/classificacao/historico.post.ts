import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const classificacaoId = Number(body.classificacao) 

  if (!classificacaoId) return { status: 'failed', message: 'Classificação não informada' }

  try {
    const pool = await useDb()
    
    const mockHistorico = [
      {
        codigo: 999,
        dataAlteracao: '28/02/2026 14:20',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- Classificação foi ativada.',
          '- O campo Descrição da Classificação foi alterado de: <span style="color:#cc0000">Erro</span> para: <span style="color:green"> Sucesso</span>'
        ]
      }
    ]

    return { status: 'success', data: mockHistorico }
  } catch (erro) {
    console.error('Erro ao recuperar o histórico da classificação:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})