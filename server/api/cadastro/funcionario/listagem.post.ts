import { defineEventHandler, readBody, createError } from 'h3'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    try {
        const request = db.request()

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

        const query = `
            SELECT F.codigo, F.nomeCompleto, F.cpf, F.matricula, F.email, CP.descricao as projeto, F.ativo FROM cadastro.Funcionario F
            LEFT JOIN cadastro.projeto CP ON CP.codigo = F.projeto
            ${whereClause}
            ORDER BY F.nomeCompleto ASC
        `
        
        const result = await request.query(query)

        return {
            status: 'success',
            results: result.recordset
        }

    } catch (error: any) {
        console.error('Erro na API de listagem de funcionários:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao buscar funcionários: ' + error.message
        })
    }
})