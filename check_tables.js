import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Users/tiago/Music/eventosNTL/.env' });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: 'SGT', // Já sabemos que o BD correto da migração é o SGT, diferente do eventosNTL que era neeo_evento_dev
    port: parseInt(process.env.DB_PORT || '1433'),
    options: { encrypt: false, requestTimeout: 30000, trustServerCertificate: true }
};

async function check() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
      SELECT TABLE_SCHEMA, TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME LIKE '%movimentacao%' 
         OR TABLE_NAME LIKE '%extrato%' 
         OR TABLE_NAME LIKE '%lancamento%'
    `);
        console.log(JSON.stringify(result.recordset, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
