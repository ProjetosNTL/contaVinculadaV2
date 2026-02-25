import sql from 'mssql'
import { useRuntimeConfig } from '#imports'

let pool: sql.ConnectionPool | null = null

export const useDb = async () => {
    const config = useRuntimeConfig()

    if (pool && pool.connected) {
        return pool
    }

    try {
        const dbConfig: any = {
            server: config.dbServer,
            user: config.dbUser,
            password: config.dbPass,
            database: config.dbName,
            port: Number(config.dbPort) || 1433,
            options: {
                encrypt: false, // para testes locais, ou true se certificado for obrigatório
                trustServerCertificate: true,
                enableArithAbort: true
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000
            }
        }

        pool = new sql.ConnectionPool(dbConfig)
        await pool.connect()
        console.log('Conectado ao MSSQL com sucesso!')
        return pool
    } catch (err: any) {
        console.error('Falha ao conectar no MSSQL:', err.message)
        throw err
    }
}
