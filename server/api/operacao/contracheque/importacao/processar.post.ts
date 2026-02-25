import { useDb } from '../../../../utils/db'

// Utilitário para formatar moeda vinda do TXT (1.000,00 -> 1000.00)
function parseMoedaBR(valorString: string): number {
    if (!valorString) return 0
    const clean = valorString.replace(/\./g, '').replace(',', '.')
    const num = parseFloat(clean)
    return isNaN(num) ? 0 : num
}

function getMesNum(mesNome: string): string {
    const map: Record<string, string> = {
        'janeiro': '01', 'fevereiro': '02', 'março': '03', 'abril': '04',
        'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
        'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
    }
    return map[mesNome.toLowerCase()] || '00'
}

export default defineEventHandler(async (event) => {
    const formData = await readMultipartFormData(event)
    if (!formData) {
        throw createError({ statusCode: 400, statusMessage: 'Nenhum formulário enviado' })
    }

    const usuarioLogadoId = 1 // TODO: auth
    const db = await useDb()

    // Extrair campos do form
    let mesAnoStr = ''
    let fileData: Buffer | undefined

    for (const field of formData) {
        if (field.name === 'ano') {
            mesAnoStr = field.data.toString()
        }
        if (field.name === 'xmlNota' && field.filename) {
            fileData = field.data
        }
    }

    if (!mesAnoStr || !fileData) {
        return { status: 'failed', mensagem: 'Mês/Ano ou Arquivo não informados.' }
    }

    // Converter mesAnoStr (MM/YYYY) para "YYYY-MM-01"
    const [mesForm, anoForm] = mesAnoStr.split('/')
    const mesReferenteDoFormulario = `${anoForm}-${mesForm}-01`

    // Converter buffer para string e quebrar em linhas (Windows-1252 -> utf-8 simplificado via parser)
    const decoder = new TextDecoder('windows-1252')
    const fileString = decoder.decode(fileData)
    const linhas = fileString.split(/\r?\n/)

    try {
        const request = db.request()

        // Pegar verbas de crédito do DB
        const resultVerbas = await request.query(`SELECT codigoReferencia, tipo FROM cadastro.verbas WHERE ativo = 1 AND tipo = 1`)
        const codigosCredito = resultVerbas.recordset.map(r => parseInt(r.codigoReferencia))

        let arrayContracheque: any[] = []
        let funcionarioAtual: any = null
        let contrachequesEncontradosNoArquivo = 0
        let mesDoArquivoValidado = false

        for (const data of linhas) {
            if (!data.trim()) continue
            const linha = data.trim()

            if (!mesDoArquivoValidado && linha.toLowerCase().includes("referente ao mês de")) {
                const regex = /Referente ao mês de\s+([A-Za-zç]+)\/(\d{4})/i
                const match = linha.match(regex)
                if (match) {
                    const mesNome = match[1] || ''
                    const anoArquivo = match[2] || ''
                    const curMes = getMesNum(mesNome)
                    const mesDoArquivo = `${anoArquivo}-${curMes}-01`

                    if (mesDoArquivo !== mesReferenteDoFormulario) {
                        return { status: 'failed', mensagem: 'Mês e ano informados não correspondem ao do arquivo.' }
                    }
                    mesDoArquivoValidado = true
                }
            }

            if (linha.includes("Adm:") && linha.includes("CPF:")) {
                // Salva o atual antes de iniciar um novo
                if (funcionarioAtual) {
                    funcionarioAtual.salarioLiquido = funcionarioAtual.tipoDeCalculo === 1
                        ? funcionarioAtual.salarioBase
                        : funcionarioAtual.salarioBase + funcionarioAtual.outrosCreditos

                    if (funcionarioAtual.salarioLiquido > 0) arrayContracheque.push(funcionarioAtual)
                }

                contrachequesEncontradosNoArquivo++
                funcionarioAtual = null // Reset para o próximo

                const matriculaPartes = linha.split(/\s+/)
                const matricula = matriculaPartes[0]

                const posAdm = linha.indexOf('Adm:')
                const posCpf = linha.indexOf('CPF:')
                const cpfRaw = linha.substring(posCpf + 4, posCpf + 4 + 15).trim()
                const cpfLimpo = cpfRaw.replace(/[^\d]/g, '')

                // formatar para busca "111.222.333-44" (assumindo que no banco está pontuado)
                let cpfVerificar = cpfLimpo
                if (cpfLimpo.length === 11) {
                    cpfVerificar = `${cpfLimpo.substring(0, 3)}.${cpfLimpo.substring(3, 6)}.${cpfLimpo.substring(6, 9)}-${cpfLimpo.substring(9, 11)}`
                }

                // Busca infos (Projeto, Parametros)
                const checkReq = db.request()
                checkReq.input('cpf', cpfVerificar)

                const sqlParams = `
          SELECT F.projeto, P.tipoDeCalculo, PF.decimoTerceiro, PF.feriasConstitucional, PF.multaFgts, PF.submodulo 
          FROM cadastro.Funcionario F
          LEFT JOIN cadastro.projeto P ON F.projeto = P.codigo
          LEFT JOIN configuracao.parametroFinanceiro PF ON P.codigo = PF.projeto AND PF.ativo = 1
          WHERE F.cpf = @cpf
        `
                const resParams = await checkReq.query(sqlParams)

                if (resParams.recordset.length === 0) continue // Pula se nao achar

                const projData = resParams.recordset[0]
                const projetoId = projData.projeto

                const checkVerbaReq = db.request()
                checkVerbaReq.input('projeto', projetoId)
                const sqlVerba = `
          SELECT CV.codigoReferencia 
          FROM cadastro.projetoVerba PV
          LEFT JOIN cadastro.verbas CV ON PV.verba = CV.codigo
          WHERE PV.projeto = @projeto
        `
                const resVerbas = await checkVerbaReq.query(sqlVerba)
                const verbasNaoCalculadas = resVerbas.recordset.filter(r => r.codigoReferencia).map(r => parseInt(r.codigoReferencia))

                funcionarioAtual = {
                    cpf: cpfVerificar,
                    matricula: matricula,
                    salarioBase: 0,
                    outrosCreditos: 0,
                    salarioLiquido: 0,
                    projeto: projetoId,
                    tipoDeCalculo: projData.tipoDeCalculo,
                    verbasNaoCalculadas,
                    parametroFinanceiros: projData
                }
            }

            // Leitura de verbas do funcionario atual
            if (funcionarioAtual) {
                // separador de dois espaços ou mais entre codigo e valor (geralmente extratos tem "05  SALARIO BASE    1.500,00")
                const colunas = linha.split(/\s{2,}/)
                if (colunas.length > 1 && !isNaN(Number(colunas[0]))) {
                    const codigoVerba = parseInt(colunas[0])
                    const valorString = colunas[colunas.length - 1] || ''

                    if (!funcionarioAtual.verbasNaoCalculadas.includes(codigoVerba)) {
                        const val = parseMoedaBR(valorString as string)
                        if (codigoVerba === 5 || codigoVerba === 6005 || codigoVerba === 8006) {
                            funcionarioAtual.salarioBase = val
                        } else if (codigosCredito.includes(codigoVerba)) {
                            funcionarioAtual.outrosCreditos += val
                        }
                    }
                }
            }
        } // Fim Iteração Linhas

        // Empurrar o ultimo que ficou no loop
        if (funcionarioAtual) {
            funcionarioAtual.salarioLiquido = funcionarioAtual.tipoDeCalculo === 1
                ? funcionarioAtual.salarioBase
                : funcionarioAtual.salarioBase + funcionarioAtual.outrosCreditos
            if (funcionarioAtual.salarioLiquido > 0) arrayContracheque.push(funcionarioAtual)
        }

        // Processamento e Inserção Final
        let alterados = 0
        for (const item of arrayContracheque) {
            const uReq = db.request()
            uReq.input('cpf', item.cpf)
            uReq.input('mesAno', mesReferenteDoFormulario)

            const oldRes = await uReq.query(`SELECT codigo, valorLiquido, statusAprovacao FROM operacao.baseContracheque WHERE cpf = @cpf AND mesAno = @mesAno`)

            let chamarProcedure = false
            let codigoExistente = 0

            if (oldRes.recordset.length === 0) {
                chamarProcedure = true
            } else {
                const rowOld = oldRes.recordset[0]
                codigoExistente = rowOld.codigo
                if (rowOld.statusAprovacao === 0) {
                    chamarProcedure = true // Reprovado, permite sobrescrever
                    codigoExistente = 0
                } else {
                    // Verifica se valor mudou
                    if (Math.round(item.salarioLiquido * 100) !== Math.round(rowOld.valorLiquido * 100)) {
                        chamarProcedure = true
                    }
                }
            }

            if (chamarProcedure) {
                const decimo = (item.salarioLiquido * (item.parametroFinanceiros.decimoTerceiro || 0)) / 100
                const ferias = (item.salarioLiquido * (item.parametroFinanceiros.feriasConstitucional || 0)) / 100
                const multa = (item.salarioLiquido * (item.parametroFinanceiros.multaFgts || 0)) / 100
                const sub = (item.salarioLiquido * (item.parametroFinanceiros.submodulo || 0)) / 100
                const ret = decimo + ferias + multa + sub

                // Busca Nome Funcionario de novo pra salvar
                const fReq = db.request()
                fReq.input('cpfFunc', item.cpf)
                const fRes = await fReq.query(`SELECT nomeCompleto FROM cadastro.Funcionario WHERE cpf = @cpfFunc`)
                const nomeFunc = fRes.recordset.length > 0 ? fRes.recordset[0].nomeCompleto : 'DESCONHECIDO'

                const procReq = db.request()
                procReq.input('codigo', codigoExistente)
                procReq.input('funcionario', nomeFunc)
                procReq.input('cpf', item.cpf)
                procReq.input('projeto', item.projeto)
                procReq.input('valorLiquido', item.salarioLiquido)
                procReq.input('matricula', item.matricula)
                procReq.input('mesAno', mesReferenteDoFormulario)
                procReq.input('decimoTerceiro', decimo)
                procReq.input('feriasConstitucional', ferias)
                procReq.input('multaFgts', multa)
                procReq.input('submodulo', sub)
                procReq.input('valorRetencao', ret)
                procReq.input('statusAprovacao', 2) // PENDENTE
                procReq.input('usuario', usuarioLogadoId)

                await procReq.query(`
            EXEC operacao.baseContracheque_Atualiza 
                @codigo = @codigo,
                @funcionario = @funcionario,
                @cpf = @cpf,
                @projeto = @projeto,
                @valorLiquido = @valorLiquido,
                @matricula = @matricula,
                @mesAno = @mesAno,
                @decimoTerceiro = @decimoTerceiro,
                @feriasConstitucional = @feriasConstitucional,
                @multaFgts = @multaFgts,
                @submodulo = @submodulo,
                @valorRetencao = @valorRetencao,
                @statusAprovacao = @statusAprovacao,
                @usuario = @usuario
          `)
                alterados++
            }
        }

        if (contrachequesEncontradosNoArquivo > 0 && alterados === 0) {
            return { status: 'failed', mensagem: 'Todos os contra-cheques deste arquivo já foram importados ou não sofreram alteração de valor.' }
        } else {
            return { status: 'success', mensagem: `${alterados} contracheques foram importados para processamento como Pendentes.` }
        }

    } catch (err: any) {
        console.error(err)
        return { status: 'failed', mensagem: 'Erro ao processar importação: ' + err.message }
    }
})
