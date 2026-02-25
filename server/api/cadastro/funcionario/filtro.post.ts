import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    try {
        const request = db.request()

        let baseQuery = `
      SELECT 
        F.codigo, F.nomeCompleto, F.cpf, F.matricula, F.email, CP.descricao as projeto, F.ativo 
      FROM cadastro.Funcionario F
      LEFT JOIN cadastro.projeto CP ON CP.codigo = F.projeto
      WHERE (1 = 1)
    `

        // Aplicando filtros dinâmicos
        if (body.nomeParam) {
            baseQuery += ` AND F.nomeCompleto LIKE @nome`
            request.input('nome', `%${body.nomeParam}%`)
        }

        if (body.cpfParam) {
            baseQuery += ` AND F.cpf = @cpf`
            request.input('cpf', body.cpfParam)
        }

        if (body.matriculaParam) {
            baseQuery += ` AND F.matricula LIKE @matricula`
            request.input('matricula', `%${body.matriculaParam}%`)
        }

        if (body.emailParam) {
            baseQuery += ` AND F.email LIKE @email`
            request.input('email', `%${body.emailParam}%`)
        }

        if (body.projetoParam) {
            baseQuery += ` AND F.projeto = @projeto`
            request.input('projeto', parseInt(body.projetoParam))
        }

        if (body.ativoParam !== '' && body.ativoParam !== undefined) {
            baseQuery += ` AND F.ativo = @ativo`
            request.input('ativo', parseInt(body.ativoParam))
        }

        // Ordenação padrão
        baseQuery += ` ORDER BY F.nomeCompleto ASC`

        const result = await request.query(baseQuery)

        return {
            status: 'success',
            results: result.recordset
        }

    } catch (error: any) {
        console.error('Erro na API de filtro de funcionários:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Falha ao buscar funcionários: ' + error.message
        })
    }
})
