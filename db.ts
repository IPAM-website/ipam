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
    port: parseInt(POSTGRES_PORT || '5432'),
    connection: {
        timeout: 5  // Timeout in secondi
    },
    onnotice: () => {}, // Disabilita notifiche non necessarie
    debug: (connection, query) => {
        console.log('Query:', query)
    }
});

console.log('Connected to PostgreSQL')

export default sql;