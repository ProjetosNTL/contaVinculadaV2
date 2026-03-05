import { defineEventHandler, readBody, createError } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    try {
        const request = db.request()

        const pagina = Number(body.pagina) || 1
        const itensPorPagina = Number(body.itensPorPagina) || 10
        const offset = (pagina - 1) * itensPorPagina

        let whereClause = ` WHERE (1 = 1)`

        if (body.nomeParam) {
            whereClause += ` AND F.nomeCompleto LIKE @nome`
            request.input('nome', `%${body.nomeParam}%`)
        }
        if (body.cpfParam) {
            whereClause += ` AND F.cpf = @cpf`
            request.input('cpf', body.cpfParam)
        }
        if (body.matriculaParam) {
            whereClause += ` AND F.matricula LIKE @matricula`
            request.input('matricula', `%${body.matriculaParam}%`)
        }
        if (body.emailParam) {
            whereClause += ` AND F.email LIKE @email`
            request.input('email', `%${body.emailParam}%`)
        }
        if (body.projetoParam) {
            whereClause += ` AND F.projeto = @projeto`
            request.input('projeto', parseInt(body.projetoParam))
        }
        if (body.ativoParam !== '' && body.ativoParam !== undefined) {
            whereClause += ` AND F.ativo = @ativo`
            request.input('ativo', parseInt(body.ativoParam))
        }

        const countQuery = `
            SELECT COUNT(F.codigo) as total 
            FROM cadastro.Funcionario F
            LEFT JOIN cadastro.projeto CP ON CP.codigo = F.projeto
            ${whereClause}
        `
        const countResult = await request.query(countQuery)
        const totalRegistros = countResult.recordset[0].total

        request.input('offset', offset)
        request.input('limit', itensPorPagina)

        const selectQuery = `
            SELECT 
                F.codigo, F.nomeCompleto, F.cpf, F.matricula, F.email, CP.descricao as projeto, F.ativo 
            FROM cadastro.Funcionario F
            LEFT JOIN cadastro.projeto CP ON CP.codigo = F.projeto
            ${whereClause}
            ORDER BY F.nomeCompleto ASC
            OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
        `
        const listResult = await request.query(selectQuery)

        return {
            status: 'success',
            results: listResult.recordset,
            total: totalRegistros
        }

    } catch (error: any) {
        console.error('Erro na API de listagem de funcionários:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao buscar funcionários: ' + error.message
        })
    }
})