import { type RequestHandler } from '@builder.io/qwik-city';
import sql from '../../../../db';
import { parseCSV } from '~/components/utils/parseCSV';

export const onPost: RequestHandler = async ({ request, json }) => {
    try {
        /*const formData = await request.formData();
        const file = formData.get('file') as File;
        
        // Parsing CSV
        const csvData = await parseCSV(file);
        
        // Validazione dati
        for (const row of csvData.data) {
            // Verifica cliente
            const cliente = await sql`
                SELECT IDCliente FROM Clienti WHERE nomeCliente = ${row.nomeCliente}
            `;
            
            if (!cliente.count) {
                return json(400, { 
                    error: `Cliente non trovato: ${row.nomeCliente}` 
                });
            }

            // Verifica città + paese
            const citta = await sql`
                SELECT c.IDCitta 
                FROM Citta c
                JOIN Paesi p ON c.IDPaese = p.IDPaese
                WHERE c.nomeCitta = ${row.nomeCitta} 
                AND p.nomePaese = ${row.nomePaese}
            `;
            
            if (!citta.count) {
                return json(400, { 
                    error: `Città non trovata: ${row.nomeCitta} (${row.nomePaese})` 
                });
            }
        }

        // Inserimento dati
        const inserted = await sql`
            INSERT INTO Siti ${sql(
                csvData.data.map(row => ({
                    nomeSito: row.nomeSito,
                    IDCitta: sql`(SELECT IDCitta FROM Citta WHERE nomeCitta = ${row.nomeCitta})`,
                    datacenter: row.datacenter === 'true',
                    tipologia: row.tipologia,
                    IDCliente: sql`(SELECT IDCliente FROM Clienti WHERE nomeCliente = ${row.nomeCliente})`
                })),
                'nomeSito',
                'IDCitta',
                'datacenter',
                'tipologia',
                'IDCliente'
            )}
            RETURNING IDSito
        `;

        json(200, { inserted: inserted.count });*/
        console.log('Importazione CSV avviata');
        console.log('File:', request);

    } catch (err) {
        json(500, { error: err instanceof Error ? err.message : 'Errore sconosciuto' });
    }
};
