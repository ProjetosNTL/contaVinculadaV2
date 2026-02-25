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
        dataOficio,
        valorOficio,
        dataResposta,
        dataEntrada,
        status,
        funcionarios = []
    } = body

    const cookies = parseCookies(event)
    const usuario = cookies.user ? JSON.parse(cookies.user).codigo : 1

    if (!projeto || !contaVinculada || !tipoMovimentacao || !valorMovimentacao || !dataMovimentacao || !motivo) {
        return { status: 'failed', mensagem: 'Por favor, preencha os campos obrigatórios básicos.' }
    }

    try {
        const request = db.request()

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

        const formatarNum = (val: any) => {
            if (typeof val === 'string') return parseFloat(val.replace(/\\./g, '').replace(',', '.'))
            return val || 0
        }

        const formatarDt = (val: string) => {
            if (!val) return null
            if (val.includes('/')) {
                const [d, m, y] = val.split('/')
                return `${y}-${m}-${d}`
            }
            return val
        }

        request.input('codigo', Math.floor(codigo || 0))
        request.input('projeto', parseInt(projeto))
        request.input('contaVinculada', parseInt(contaVinculada))
        request.input('tipoMovimentacao', parseInt(tipoMovimentacao))
        request.input('valorMovimentacao', formatarNum(valorMovimentacao))
        request.input('dataMovimentacao', formatarDt(dataMovimentacao))
        request.input('motivo', motivo)

        request.input('dataOficio', formatarDt(dataOficio))
        request.input('valorOficio', formatarNum(valorOficio))
        request.input('dataResposta', formatarDt(dataResposta))
        request.input('dataEntrada', formatarDt(dataEntrada))
        request.input('status', status ? parseInt(status) : null)

        request.input('usuario', parseInt(usuario))
        request.input('xmlFuncionario', xmlFuncionario)

        const sql = `
            EXEC operacao.lancamentoReembolso_Atualiza
                @codigo = @codigo,
                @projeto = @projeto,
                @contaVinculada = @contaVinculada,
                @tipoMovimentacao = @tipoMovimentacao,
                @valorMovimentacao = @valorMovimentacao,
                @dataMovimentacao = @dataMovimentacao,
                @motivo = @motivo,
                @dataOficio = @dataOficio,
                @valorOficio = @valorOficio,
                @dataResposta = @dataResposta,
                @dataEntrada = @dataEntrada,
                @status = @status,
                @usuario = @usuario,
                @xmlFuncionario = @xmlFuncionario
        `

        await request.query(sql)

        return {
            status: 'success',
            mensagem: 'Operação realizada com sucesso.'
        }

    } catch (error: any) {
        console.error('Erro ao gravar lançamento reembolso:', error)
        return { status: 'failed', mensagem: 'Erro na API de gravação: ' + error.message }
    }
})
