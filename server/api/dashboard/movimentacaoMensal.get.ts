import { useDb } from '../../utils/db'

export default defineEventHandler(async () => {
  const db = await useDb()

  try {
    // Busca movimentações dos últimos 6 meses
    const result = await db.request().query(`
      SELECT 
        MONTH(dataCadastro) as mes, 
        YEAR(dataCadastro) as ano, 
        SUM(CASE WHEN tipoMovimentacao = 1 THEN valorMovimentacao ELSE 0 END) as entradas, 
        SUM(CASE WHEN tipoMovimentacao != 1 THEN valorMovimentacao ELSE 0 END) as saidas 
      FROM operacao.extrato 
      WHERE dataCadastro >= DATEADD(month, -6, GETDATE()) 
      GROUP BY YEAR(dataCadastro), MONTH(dataCadastro) 
      ORDER BY ano ASC, mes ASC
    `)

    const meses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ]

    const data = result.recordset.map((row: any) => {
      return {
        mesAno: `${meses[row.mes - 1]}/${row.ano.toString().slice(-2)}`,
        entradas: Number(row.entradas || 0),
        saidas: Number(row.saidas || 0)
      }
    })

    // Se vierem menos de 6 meses, preenche com zeros ou apenas retorna o que tem
    return {
      status: 'success',
      data: data
    }
  } catch (error: any) {
    console.error('Erro ao buscar movimentação mensal:', error)
    return {
      status: 'failed',
      data: []
    }
  }
})
