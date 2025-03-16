import postgres from 'postgres'

const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_HOST, POSTGRES_PORT } = process.env

if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_HOST) {
    throw new Error('Missing required environment variables')
}

const sql = postgres({ 
    hostname: POSTGRES_HOST,
    database: POSTGRES_DB,
    username: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port: parseInt(POSTGRES_PORT || '5432')
});

console.log('Connected to PostgreSQL')

export default sql;