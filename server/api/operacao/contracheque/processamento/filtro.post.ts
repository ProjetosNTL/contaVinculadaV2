import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const { mesAno, projeto, cpf, status } = body

    try {
        const request = db.request()

        let sql = `
      SELECT 
        C.codigo, 
        C.funcionario, 
        C.cpf, 
        P.descricao AS projeto, 
        C.valorLiquido, 
        C.matricula, 
        C.mesAno, 
        C.decimoTerceiro, 
        C.feriasConstitucional, 
        C.multaFgts, 
        C.submodulo, 
        C.valorRetencao, 
        C.statusAprovacao 
      FROM operacao.baseContracheque C 
      LEFT JOIN cadastro.projeto P ON P.codigo = C.projeto
      WHERE (1=1)
    `

        if (mesAno && mesAno !== '0') {
            // mesAno vem como MM/YYYY, precisa virar YYYY-MM-01 na query MSSQL
            const partes = mesAno.split('/')
            if (partes.length === 2) {
                request.input('mesAno', `${partes[1]}-${partes[0]}-01`)
                sql += ` AND C.mesAno = @mesAno `
            }
        }

        if (projeto && projeto !== '0' && projeto !== '') {
            request.input('projeto', parseInt(projeto))
            sql += ` AND C.projeto = @projeto `
        }

        if (cpf && cpf.trim() !== '') {
            request.input('cpf', cpf.trim())
            sql += ` AND C.cpf = @cpf `
        }

        if (status !== undefined && status !== null && status !== ' ' && status !== '') {
            request.input('status', parseInt(status))
            sql += ` AND C.statusAprovacao = @status `
        }

        const result = await request.query(sql)

        return {
            status: 'success',
            results: result.recordset
        }

    } catch (error: any) {
        console.error('Erro na listagem de Contracheque:', error)
        return { status: 'failed', mensagem: 'Erro na API de filtro: ' + error.message }
    }
})
