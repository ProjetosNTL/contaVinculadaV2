import { useDb } from '../../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const {
        codigo = 0,
        projeto,
        contaVinculada,
        tipoMovimentacao,
        valorMovimentacao,
        dataMovimentacao,
        motivo,
        funcionarios = [] // Array de { codigoFuncionario, funcionarioId, tipoAlteracao }
    } = body

    // Pegando usuário da sessão legada via cookies ou default
    const cookies = parseCookies(event)
    const usuario = cookies.user ? JSON.parse(cookies.user).codigo : 1 // fallback para 1 (admin) se não tiver auth implementada restrita

    if (!projeto || !contaVinculada || !tipoMovimentacao || !valorMovimentacao || !dataMovimentacao || !motivo) {
        return { status: 'failed', mensagem: 'Por favor, preencha todos os campos obrigatórios.' }
    }

    try {
        const request = db.request()

        // Montar o XML de Funcionarios (FluidXML like in PHP)
        let xmlFuncionario = '<ArrayOfFuncionario>'
        for (const item of funcionarios) {
            xmlFuncionario += `
                <funcionario>
                    <codigo>${item.codigoFuncionario || 0}</codigo>
                    <funcionario>${item.funcionarioId}</funcionario>
                    <tipoAlteracao>${item.tipoAlteracao || 1}</tipoAlteracao>
                </funcionario>`
        }
        xmlFuncionario += '</ArrayOfFuncionario>'

        // Formatação de valor e data para o banco
        // o valorMovimentacao pode já vir como number ou string c/ virgula
        let valorFmt = typeof valorMovimentacao === 'string' ? parseFloat(valorMovimentacao.replace(/\./g, '').replace(',', '.')) : valorMovimentacao

        // Data format: DD/MM/YYYY -> YYYY-MM-DD
        let dataFmt = dataMovimentacao
        if (dataMovimentacao.includes('/')) {
            const [d, m, y] = dataMovimentacao.split('/')
            dataFmt = `${y}-${m}-${d}`
        }

        // Params
        request.input('codigo', Math.floor(codigo || 0))
        request.input('projeto', parseInt(projeto))
        request.input('contaVinculada', parseInt(contaVinculada))
        request.input('tipoMovimentacao', parseInt(tipoMovimentacao))
        request.input('valorMovimentacao', valorFmt)
        request.input('dataMovimentacao', dataFmt)
        request.input('motivo', motivo)
        request.input('usuario', parseInt(usuario))
        request.input('xmlFuncionario', xmlFuncionario)

        const sql = `
            EXEC operacao.lancamentoManual_Atualiza
                @codigo = @codigo,
                @projeto = @projeto,
                @contaVinculada = @contaVinculada,
                @tipoMovimentacao = @tipoMovimentacao,
                @valorMovimentacao = @valorMovimentacao,
                @dataMovimentacao = @dataMovimentacao,
                @motivo = @motivo,
                @usuario = @usuario,
                @xmlFuncionario = @xmlFuncionario
        `

        // Em Procedures que performam INSERT/UPDATE, o mssql retorna result mesmo sem SELECT
        await request.query(sql)

        return {
            status: 'success',
            mensagem: 'Operação realizada com sucesso.'
        }

    } catch (error: any) {
        console.error('Erro ao gravar lançamento manual:', error)
        return { status: 'failed', mensagem: 'Erro na API de gravação: ' + error.message }
    }
})
