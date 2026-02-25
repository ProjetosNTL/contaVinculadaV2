import { useDb } from '../../utils/db'

export default defineEventHandler(async () => {
    try {
        const db = await useDb()
        const request = db.request()

        // Lista tabelas e views que tenham movimentacao, extrato ou lançamento no nome
        const qr = await request.query(`
      SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME LIKE '%movimentacao%' 
         OR TABLE_NAME LIKE '%extrato%' 
         OR TABLE_NAME LIKE '%lancamento%'
    `)

        return { data: qr.recordset }
    } catch (e: any) {
        return { error: e.message }
    }
})
