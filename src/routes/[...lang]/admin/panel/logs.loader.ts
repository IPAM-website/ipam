// src/routes/[locale]/admin/panel/logs.loader.ts
import { routeLoader$ } from '@builder.io/qwik-city';
import fs from 'fs/promises';
import path from 'path';

// NTC NO-ROUTELOADER fuori dalle Route dioboia

// eslint-disable-next-line qwik/loader-location
export const useLogsLoader = routeLoader$(async () => {
    const logPath = path.resolve(process.cwd(), 'logs/postgresql.log');

    try {
        const stats = await fs.stat(logPath);
        if (!stats.isFile()) throw new Error('Not a file');

        const logFile = await fs.readFile(logPath, 'utf-8');
        return logFile
            .split('\n')
            .filter(line => line.trim())
            .slice(-100)
            .reverse();
    } catch (err) {
        return [`Errore lettura log: ${err}`];
    }
});
