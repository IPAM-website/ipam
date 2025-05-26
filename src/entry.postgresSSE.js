import express from 'express';
import { Client } from 'pg';

const app = express();
const PORT = process.env.SSE_PORT || 3010;

// Connessione a Postgres per LISTEN/NOTIFY
const pgClient = new Client({
    host: 'db',
    port: '5432',
    user: 'postgres',
    password: 'postgres',
    database: 'ipam',
});

pgClient.connect().then(() => {
    pgClient.query('LISTEN data_changes');
    console.log('SSE server: LISTEN su data_changes');
});

let clients = [];

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

pgClient.on('notification', (msg) => {
    for (const client of clients) {
        client.write(`data: ${msg.payload}\n\n`);
    }
});

pgClient.on('error', (err) => {
    console.error('Errore nella connessione Postgres:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`SSE server ascolta su http://localhost:${PORT}/events`);
});
