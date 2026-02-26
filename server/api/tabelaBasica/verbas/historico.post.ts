import { defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const codigoVerba = Number(body.codigoVerba)

  if (!codigoVerba) {
    return { status: 'failed', message: 'Verba não informada' }
  }

  try {
    const pool = await useDb()

    const mockHistorico = [
      {
        codigo: 5551,
        dataAlteracao: '26/02/2026 14:00',
        usuarioAlteracao: 'admin',
        alteracoes: [
          '- O campo Tipo de verba foi alterado de: <span style="color:#cc0000">Débito</span> para: <span style="color:green"> Crédito</span>'
        ]
      }
    ]

    return {
      status: 'success',
      data: mockHistorico
    }
  } catch (erro) {
    console.error('Erro ao recuperar o histórico da verba:', erro)
    return { status: 'failed', message: 'Erro ao buscar o histórico.' }
  }
})