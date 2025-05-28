import express from 'express';
import { createSqlClient } from '../db';

const app = express();
const PORT = 3010;

let clients: any[] = [];

// Crea il client SQL una volta per tutto il processo Express
const sql = createSqlClient(process.env);

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();
    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(c => c !== res);
        res.end()
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`SSE server ascolta su http://localhost:${PORT}/events`);

    // Connessione a Postgres per LISTEN/NOTIFY
    await sql.listen('data_changes', payload => {
        const json = JSON.parse(payload)
        for (const client of clients) {
            client.write(`data: ${JSON.stringify(json)}\n\n`);
        }
    })
});
