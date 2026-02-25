import { useDb } from '../../utils/db'

export default defineEventHandler(async () => {
    const db = await useDb()

    try {
        const result = await db.request().query(`
            SELECT
                (SELECT COUNT(*) FROM cadastro.Funcionario WHERE ativo = 1) AS funcionariosAtivos,
                (SELECT COUNT(*) FROM cadastro.Funcionario) AS funcionariosTotal,
                (SELECT COUNT(*) FROM operacao.baseContracheque) AS totalContracheques,
                (SELECT COUNT(*) FROM operacao.lancamentoManual) AS totalLancamentosManuais,
                (SELECT COUNT(*) FROM operacao.lancamentoReembolso) AS totalReembolsos
        `)

        const row = result.recordset[0] || {}

        return {
            status: 'success',
            data: {
                funcionariosAtivos: row.funcionariosAtivos ?? 0,
                funcionariosTotal: row.funcionariosTotal ?? 0,
                totalContracheques: row.totalContracheques ?? 0,
                totalLancamentosManuais: row.totalLancamentosManuais ?? 0,
                totalReembolsos: row.totalReembolsos ?? 0,
            }
        }
    } catch (error: any) {
        console.error('Erro ao buscar estatísticas do dashboard:', error)
        // Retorna zeros em caso de erro, sem quebrar o dashboard
        return {
            status: 'success',
            data: {
                funcionariosAtivos: 0,
                funcionariosTotal: 0,
                totalContracheques: 0,
                totalLancamentosManuais: 0,
                totalReembolsos: 0,
            }
        }
    }
})
