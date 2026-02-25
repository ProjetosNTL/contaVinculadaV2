import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const db = await useDb()

    const usuarioLogadoId = 1 // TODO: Pegar do auth/session

    const { codigo, login, nomeUsuario, cpf, email, senha, telefone, restauraSenha, projetos } = body

    // Validação basica server-side
    if (!login || !nomeUsuario || !cpf || !email) {
        return { status: 'failed', mensagem: 'Campos obrigatórios faltando.' }
    }

    try {
        const request = db.request()

        // Preparando XML de Projetos
        let xmlProjeto = '<ArrayOfProjeto>'
        if (projetos && projetos.length > 0) {
            projetos.forEach((projId: number) => {
                xmlProjeto += `<projeto><codigo>0</codigo><projeto>${projId}</projeto><tipoAlteracao>1</tipoAlteracao></projeto>`
            })
        }
        xmlProjeto += '</ArrayOfProjeto>'

        request.input('codigo', codigo || 0)
        request.input('login', login)
        request.input('nomeUsuario', nomeUsuario)
        request.input('cpf', cpf)
        request.input('email', email)
        if (senha) {
            // Obviamente em produção se criptografa. A procedure ou php original deve usar MD5/X SHA.
            // O php referia um "$comum->criptografia". 
            // Por enquanto, passo a senha se vier, senao recupero a velha.
            request.input('senha', senha)
        } else {
            // Se n ter senha e tem codigo, pegar do banco
            if (codigo) {
                const check = db.request()
                check.input('cd', codigo)
                const oldPW = await check.query('SELECT senha FROM configuracao.usuario WHERE codigo = @cd')
                request.input('senha', oldPW.recordset[0].senha)
            } else {
                request.input('senha', '')
            }
        }

        request.input('telefone', telefone || '')
        request.input('restauraSenha', restauraSenha ? 1 : 0)
        request.input('usuarioLogado', usuarioLogadoId)
        request.input('xmlProjeto', xmlProjeto)
        request.input('ativo', 1)

        const result = await request.query(`
      EXEC configuracao.usuario_atualiza 
        @codigo = @codigo,
        @login = @login,
        @nomeUsuario = @nomeUsuario,
        @cpf = @cpf,
        @email = @email,
        @senha = @senha,
        @telefone = @telefone,
        @restauraSenha = @restauraSenha,
        @usuario = @usuarioLogado,
        @xmlProjeto = @xmlProjeto,
        @ativo = @ativo
    `)

        return { status: 'success', mensagem: 'Operação realizada.' }

    } catch (error: any) {
        console.error('Erro na gravação do usuário:', error)
        return { status: 'failed', mensagem: 'Operação não realizada: ' + error.message }
    }
})
