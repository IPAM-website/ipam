/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { $, component$, getLocale, useSignal, useStore, useTask$ } from "@builder.io/qwik";
import type { RequestHandler, DocumentHead } from "@builder.io/qwik-city";
import { routeLoader$, routeAction$, zod$, z, Form, useNavigate } from "@builder.io/qwik-city";
import ClientList from "~/components/lists/ClientList";
import Title from "~/components/layout/Title";
import PopupModal from "~/components/ui/PopupModal";
import SelectForm from "~/components/form/formComponents/SelectForm";
import TextBoxForm from "~/components/form/formComponents/TextboxForm";
import TableInfoCSV from "~/components/table/tableInfoCSV";
import { getBaseURL, getUser } from "~/fnUtils";
import type { ClienteModel, TecnicoModel } from "~/dbModels";
import { parseCSV } from "~/components/utils/parseCSV";
import sql from "../../../../db";
import { listaClienti } from "../admin/panel/utenti_clienti";
import countries from 'i18n-iso-countries';
import { inlineTranslate } from "qwik-speak";
import fs from "fs"

type Notification = {
    message: string;
    type: "success" | "error" | "loading";
};

export const useCSVInsert = routeAction$(async (data) => {
    const translateCountry = (input: string): string => {
        const code = countries.getAlpha2Code(input, 'it'); // Cerca in italiano
        if (!code) throw new Error(`Paese non riconosciuto: ${input}`);
        return countries.getName(code, 'en')!; // Restituisce nome in inglese
    };
    try {
        const user = await getUser()
        let idClientePrivate: number | undefined;
        //console.log("Dati validati:", data);

        if (data.clientType == "existing" && data.csvsiti == undefined && data.csvnetwork == undefined && data.csvip == undefined)
            return { error: "Errore durante l'importazione", success: false }
        // Caricamento/Ricerca cliente
        if (data.clientType == "new" && data.clienteTXT != undefined && data.clienteTXT != "") {
            const clientName: string = data.clienteTXT;
            const clienteExist = await sql`SELECT * FROM clienti WHERE nomecliente = ${data.clienteTXT}`
            if (clienteExist.length != 0)
                idClientePrivate = clienteExist[0].idcliente
            else {
                await sql.begin(async (tx) => {
                    await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);

                    const insertResult = await tx`  
                        INSERT INTO clienti (nomecliente)
                        VALUES (${clientName})
                        RETURNING idcliente
                    `;
                    idClientePrivate = insertResult[0].idcliente;
                });
            }
            //console.log(data.idcliente)  Dati inserire nome del cliente
        }
        else if (data.clientType == "existing" && data.idcliente != undefined) {
            idClientePrivate = parseInt(data.idcliente)
            //console.log(idClientePrivate)
        }
        else
            return { error: "Errore durante l'importazione del cliente", success: false };

        //console.log(idClientePrivate)

        // Importazione siti
        if (data.csvsiti != undefined) {
            const csv = await data.csvsiti.text();
            const rows = csv.split("\n").filter(row => row.trim() !== '');
            for (let i = 1; i < rows.length; i++) {
                // console.log("righe siti")
                const row = rows[i];
                try {
                    // Parsing manuale della riga CSV
                    const [nomeSitoRaw, cittaRaw, paeseRaw, datacenterRaw, tipologiaRaw] = row.split(',');
                    const nomeSito = nomeSitoRaw.replace(/^"|"$/g, '').trim();
                    const citta = cittaRaw.replace(/^"|"$/g, '').trim();
                    const paese = paeseRaw.replace(/^"|"$/g, '').trim();
                    const datacenter = datacenterRaw.toLowerCase() === 'true';
                    const tipologia = tipologiaRaw.replace(/^"|"$/g, '').trim();

                    //console.log(nomeSito, citta, paese, datacenter, tipologia)
                    //console.log(paese)

                    // 1. Verifica esistenza paese
                    const paeseResult = await sql`SELECT idpaese FROM paesi where nomePaese = ${translateCountry(paese)}`;
                    //console.log(paeseResult)

                    if (!paeseResult.count) {
                        return { error: `Paese '${paese}' non trovato`, success: false }
                    }
                    const idPaese = paeseResult[0].idpaese;

                    // 2. Trova o crea città
                    let cittaResult = await sql`
                        SELECT idcitta FROM citta 
                        WHERE nomecitta = ${citta} AND idpaese = ${idPaese}
                    `;

                    let idCitta: number;
                    if (cittaResult.count === 0) {
                        await sql.begin(async (tx) => {
                            await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
                            cittaResult = await tx`
                            INSERT INTO citta (nomecitta, idpaese)
                            VALUES (${citta}, ${idPaese})
                            RETURNING idcitta
                        `;
                        })
                        idCitta = cittaResult[0].idcitta;
                    } else {
                        idCitta = cittaResult[0].idcitta;
                    }

                    const idClientePrivate2 = idClientePrivate;
                    // 3. Inserisci sito
                    if (idClientePrivate2 !== undefined) {
                        await sql.begin(async (tx) => {
                            await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
                            await tx`
                            INSERT INTO siti (nomesito, idcitta, datacenter, tipologia, idcliente)
                            VALUES (${nomeSito}, ${idCitta}, ${datacenter}, ${tipologia}, ${idClientePrivate2})
                        `;
                        })
                    }
                    else
                        throw new Error(`Cliente non trovato`)

                } catch (err) {
                    return { error: `Riga ${i}: ${err}`, success: false }
                }
            }
        }
        else
            return { error: "Errore durante l'importazione dei siti", success: false };

        //Importazione network
        if (data.csvnetwork) {
            const csv = await data.csvnetwork.text();
            const rows = csv.split("\n").filter(row => row.trim() !== '');
            //console.log(rows)
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                try {
                    // Parsing manuale della riga CSV
                    const [nomereteRaw, descrizioneRaw, ipreteRaw, prefissoreteRaw, nomesitoRaw, cittaRaw, paeseRaw] = row.split(',');
                    const nomerete = nomereteRaw.replace(/^"|"$/g, '').trim();
                    const descrizione = descrizioneRaw.replace(/^"|"$/g, '').trim();
                    const iprete = ipreteRaw.replace(/^"|"$/g, '').trim();
                    const prefissorete = prefissoreteRaw.replace(/^"|"$/g, '').trim();
                    const nomesito = nomesitoRaw.replace(/^"|"$/g, '').trim();
                    const citta = cittaRaw.replace(/^"|"$/g, '').trim();
                    const paese = paeseRaw.replace(/^"|"$/g, '').trim();

                    //console.log(nomeSito, citta, paese, datacenter, tipologia)
                    //console.log(paese)

                    await sql.begin(async (tx) => {
                        // 1. Trova IDSito
                        const sito = await tx`
                            SELECT s.idsito 
                            FROM siti s
                            JOIN citta c ON s.idcitta = c.idcitta
                            JOIN paesi p ON c.idpaese = p.idpaese
                            WHERE s.nomesito = ${nomesito}
                            AND c.nomecitta = ${citta}
                            AND p.nomepaese = ${translateCountry(paese)}
                        `;

                        //console.log(sito)
                        if (sito.length == 0) {
                            // ERRORE: return in un contesto async non gestito
                            throw new Error(`Sito '${nomesito}' non trovato`);
                        }

                        // 2. Gestione Rete
                        let reteID: number;
                        await sql.begin(async (tx) => {
                            await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
                            const rete = await tx`
                            INSERT INTO rete (nomerete, descrizione, iprete, prefissorete)
                            VALUES (
                                ${nomerete},
                                ${descrizione},
                                ${iprete},
                                ${prefissorete}
                            )
                            ON CONFLICT (nomerete, iprete, prefissorete) DO UPDATE SET
                                descrizione = EXCLUDED.descrizione
                            RETURNING idrete
                            `;
                            reteID = rete[0].idrete;

                            // 3. Collegamento Sito-Rete
                            await tx`
                            INSERT INTO siti_rete (idsito, idrete)
                            VALUES (${sito[0].idsito}, ${reteID})
                            ON CONFLICT DO NOTHING
                        `;
                        })

                    })
                } catch (err) {
                    return { error: `Riga ${i}: ${err}`, success: false }
                }
            }
        }

        /*if (data.csvip) {
            const csv = await data.csvip.text();
            const rows = csv.split('\n').filter(row => row.trim() !== '');

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                try {
                    // 1. Split avanzato che gestisce virgole nei valori tra virgolette
                    const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                        .map(c => c.replace(/^"|"$/g, '').trim());

                    if (columns.length !== 9) {
                        throw new Error(`Numero colonne errato: ${columns.length}/9. Controlla virgole non gestite`);
                    }

                    const [
                        nomerete,
                        ipretenetwork,
                        prefissoretenetwork,
                        ip,
                        n_prefisso,
                        tipo_dispositivo,
                        nome_dispositivo,
                        brand_dispositivo,
                        VID
                    ] = columns;

                    // 2. Validazione manuale (senza librerie)
                    const isValidIP = (ip: string) => {
                        const parts = ip.split('.');
                        if (parts.length !== 4) return false;
                        return parts.every(part => {
                            const num = parseInt(part, 10);
                            return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
                        });
                    };

                    const isInSubnet = (ip: string, network: string, prefix: number) => {
                        // Implementazione base per subnet matching
                        const ipParts = ip.split('.').map(p => parseInt(p, 10));
                        const netParts = network.split('.').map(p => parseInt(p, 10));

                        // Converte in binario e confronta i primi "prefix" bit
                        const ipBin = ipParts.map(p => p.toString(2).padStart(8, '0')).join('');
                        const netBin = netParts.map(p => p.toString(2).padStart(8, '0')).join('');

                        return ipBin.substring(0, prefix) === netBin.substring(0, prefix);
                    };

                    // 3. Esegui validazioni
                    if (!isValidIP(ip)) {
                        throw new Error(`Formato IP non valido: ${ip}`);
                    }

                    if (!isValidIP(ipretenetwork)) {
                        throw new Error(`Formato rete non valido: ${ipretenetwork}`);
                    }

                    const prefisso = parseInt(prefissoretenetwork);
                    if (isNaN(prefisso) || prefisso < 0 || prefisso > 32) {
                        throw new Error(`Prefisso rete non valido: ${prefissoretenetwork}`);
                    }

                    if (!isInSubnet(ip, ipretenetwork, prefisso)) {
                        throw new Error(`IP ${ip} non appartiene a ${ipretenetwork}/${prefissoretenetwork}`);
                    }

                    await sql.begin(async (tx) => {
                        // Imposta utente per audit trail
                        await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);

                        // 4. Trova ID rete nel database
                        const networkDB = await tx`
                    SELECT idrete 
                    FROM rete 
                    WHERE nomerete = ${nomerete} 
                    AND iprete = ${ipretenetwork} 
                    AND prefissorete = ${prefissoretenetwork}::integer
                `;

                        if (!networkDB?.length) {
                            throw new Error(`Rete non trovata: ${nomerete} ${ipretenetwork}/${prefissoretenetwork}`);
                        }

                        // 5. Inserimento indirizzo
                        const result = await tx`
                    INSERT INTO indirizzi (
                        ip, idrete, n_prefisso, tipo_dispositivo, 
                        nome_dispositivo, brand_dispositivo, vid
                    ) VALUES (
                        ${ip}, 
                        ${networkDB[0].idrete}, 
                        ${parseInt(n_prefisso)},
                        ${tipo_dispositivo}, 
                        ${nome_dispositivo},
                        ${brand_dispositivo}, 
                        ${VID ? parseInt(VID) : null}
                    )
                    ON CONFLICT (ip, idrete) DO NOTHING
                    RETURNING *
                `;

                        if (!result.length) {
                            throw new Error(`IP ${ip} già esistente per questa rete`);
                        }
                    });

                } catch (err) {
                    return {
                        error: `Riga ${i}: ${(err as Error).message}`,
                        success: false
                    }
                }
            }
            return { success: true, message: "Importazione IP completata" };
        }*/

        if (data.csvip) {
            const csv = await data.csvip.text();
            const rows = csv.split('\n').filter(row => row.trim() !== '');

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                try {
                    // 1. Split avanzato che gestisce virgole nei valori tra virgolette
                    const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                        .map(c => c.replace(/^"|"$/g, '').trim());

                    if (columns.length !== 8) {
                        return { error: `Riga ${i}: 8 colonne richieste, trovate ${columns.length}` }
                    }

                    const [
                        nomerete,
                        ipretenetwork,
                        prefissoretenetwork,
                        ip,
                        n_prefisso,
                        tipo_dispositivo,
                        nome_dispositivo,
                        brand_dispositivo
                    ] = columns;

                    // 2. Validazione manuale (senza librerie)
                    const isValidIP = (ip: string) =>
                        /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(ip);

                    const isInSubnet = (ip: string, network: string, prefix: number) => {
                        // Implementazione base per subnet matching
                        const ipParts = ip.split('.').map(p => parseInt(p, 10));
                        const netParts = network.split('.').map(p => parseInt(p, 10));

                        // Converte in binario e confronta i primi "prefix" bit
                        const ipBin = ipParts.map(p => p.toString(2).padStart(8, '0')).join('');
                        const netBin = netParts.map(p => p.toString(2).padStart(8, '0')).join('');

                        return ipBin.substring(0, prefix) === netBin.substring(0, prefix);
                    };

                    // 3. Esegui validazioni
                    if (!isValidIP(ip)) {
                        return {
                            error: `Riga ${i}: Formato IP non valido: ${ip}`,
                            success: false
                        }
                    }

                    if (!isValidIP(ipretenetwork)) {
                        return {
                            error: `Riga ${i}: Formato rete non valido: ${ipretenetwork}`,
                            success: false
                        }
                    }

                    const prefisso = parseInt(prefissoretenetwork);
                    if (isNaN(prefisso) || prefisso < 0 || prefisso > 32) {
                        return {
                            error: `Riga ${i}: Prefisso rete non valido: ${prefissoretenetwork}`,
                            success: false
                        }
                    }

                    if (!isInSubnet(ip, ipretenetwork, prefisso)) {
                        return {
                            error: `Riga ${i}: IP ${ip} non appartiene a ${ipretenetwork}/${prefissoretenetwork}`,
                            success: false
                        }
                    }

                    await sql.begin(async (tx) => {
                        // Imposta utente per audit trail
                        await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);

                        // 4. Trova ID rete nel database
                        const networkDB = await tx`
                    SELECT idrete 
                    FROM rete 
                    WHERE nomerete = ${nomerete} 
                    AND iprete = ${ipretenetwork} 
                    AND prefissorete = ${prefissoretenetwork}::integer
                `;

                        if (!networkDB?.length) {
                            return {
                                error: `Riga ${i}: Rete non trovata: ${nomerete} ${ipretenetwork}/${prefissoretenetwork}`,
                                success: false
                            }
                        }

                        // 5. Inserimento indirizzo
                        const result = await tx`
                    INSERT INTO indirizzi (
                        ip, idrete, n_prefisso, tipo_dispositivo, 
                        nome_dispositivo, brand_dispositivo
                    ) VALUES (
                        ${ip}, 
                        ${networkDB[0].idrete}, 
                        ${parseInt(n_prefisso)},
                        ${tipo_dispositivo}, 
                        ${nome_dispositivo},
                        ${brand_dispositivo}
                    )
                    ON CONFLICT (ip, idrete) DO NOTHING
                    RETURNING *
                `;

                        if (!result.length) {
                            return {
                                error: `Riga ${i}: IP ${ip} già esistente per questa rete`,
                                success: false
                            }
                        }
                    });

                } catch (err) {
                    return {
                        error: `Riga ${i}: ${(err as Error).message}`,
                        success: false
                    }
                }
            }
            return { success: true, message: "Importazione IP completata" };
        }


        return { success: true }
    } catch (e) {
        console.log(e)
        throw new Error("Errore durante l'importazione:" + e)
    }
}, zod$({
    clientType: z.enum(['new', 'existing']),
    clienteTXT: z.string().optional(),
    idcliente: z.string().optional(),
    csvsiti: z.instanceof(File).optional(),
    csvnetwork: z.instanceof(File).optional(),
    csvip: z.instanceof(File).optional(),
}))


export const onRequest: RequestHandler = async ({ redirect, sharedMap, html }) => {
    let correct = "";
    try {
        const user = await getUser();
        sharedMap.set("user", user);
        //console.log(user)
        const result = await sql`SELECT idcliente FROM usercliente WHERE emailucliente = ${user.mail}`
        //console.log(result[0].idcliente.toString())
        if (result.length != 0) {
            correct = result[0].idcliente.toString();
        }
    }
    catch (e: any) {
        if (e.code != 'ECONNREFUSED')
            throw redirect(302, getBaseURL() + "login");
        else {
            const errorpage = fs.readFileSync("~/../errors/dbconnection.html", "utf-8");
            html(200, errorpage);
        }
    }
    if (correct != "")
        throw redirect(301, getBaseURL() + correct);
};

export const useUser = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('user') as TecnicoModel;
});

export default component$(() => {
    const clientListRefresh = useSignal(0);
    const lang = getLocale("en")
    const nav = useNavigate();
    // Stati di feedback per ogni sezione
    const sitiFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const networkFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const ipFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const currentIdC = useSignal('');
    const clientList = useSignal<ClienteModel[]>([]);
    const formRef = useSignal<HTMLFormElement>();
    //const fileInputRefSiti = useSignal<HTMLInputElement>();
    //const fileInputRefNetwork = useSignal<HTMLInputElement>();
    //const fileInputRefIP = useSignal<HTMLInputElement>();
    const notifications = useSignal<Notification[]>([]);
    const feedBackSVG = useStore<{ [key: string]: { type: string; message?: string } | null }>({
        siti: null,
        network: null,
        ip: null,
    });

    const clienteTXT = useSignal('');
    const user: TecnicoModel = useUser().value;
    const showModalCSV = useSignal(false);
    const showModalInfoCSV = useSignal(false)
    const viewTableSection = useSignal()
    const formAction = useCSVInsert();
    const clientType = useSignal<'new' | 'existing'>('new');
    const files = useStore<{ [key: string]: { name: string; size: number } | null }>({
        siti: null,
        network: null,
        ip: null,
    });

    const t = inlineTranslate();

    useTask$(async ({ track }) => {
        track(() => clientType.value);
        track(() => formAction.value);
        track(() => viewTableSection.value)
        track(() => showModalCSV.value)
        track(() => clientListRefresh.value)
        clientList.value = await listaClienti();
    })

    const addNotification = $((message: string, type: "success" | "error" | "loading") => {
        notifications.value = [...notifications.value, { message, type }];
        if (type !== "loading") {
            setTimeout(() => {
                notifications.value = notifications.value.filter((n) => n.message !== message);
            }, 4000);
        }
    });

    const handleUpload = $(async (e: Event, feedbackSignal: typeof sitiFeedback, type: 'siti' | 'network' | 'ip') => {
        feedBackSVG[type] = { type: "loading", message: "Caricamento in corso..." };
        //await new Promise(resolve => setTimeout(resolve, 10000));
        try {
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files?.[0];

            if (!file) {
                feedbackSignal.value = { message: "Nessun file selezionato", type: "error" };
                feedBackSVG[type] = {
                    type: "error",
                    message: "Nessun file selezionato"
                };
                return;
            }

            // Verifica estensione e tipo file
            if (!file.name.endsWith('.csv') || !['text/csv', 'application/vnd.ms-excel'].includes(file.type)) {
                feedbackSignal.value = { message: "Il file deve essere un CSV", type: "error" };
                feedBackSVG[type] = {
                    type: "error",
                    message: "Il file deve essere un CSV"
                };
                return;
            }

            if (file.size === 0) { // <--- Controllo dimensione file
                feedbackSignal.value = { message: "Il file e' vuoto", type: "error" };
                feedBackSVG[type] = {
                    type: "error",
                    message: "Il file e' vuoto"
                };
                return;
            }

            // Parsing CSV
            const csvData = await parseCSV(file);

            // Verifica headers
            if (csvData.headers.length === 0) {
                feedbackSignal.value = { message: "Il file CSV è vuoto", type: "error" };
                feedBackSVG[type] = {
                    type: "error",
                    message: "Il file CSV è vuoto"
                };
                return;
            }

            if (type == 'siti') {
                const requiredHeaders = ['nomesito', 'citta', 'paese', 'datacenter', 'tipologia'];
                if (!requiredHeaders.every(h => csvData.headers.includes(h))) {
                    feedbackSignal.value = {
                        message: `Header mancanti. Richiesti: ${requiredHeaders.join(', ')}`,
                        type: "error"
                    };
                    feedBackSVG[type] = {
                        type: "error",
                        message: `Header mancanti. Richiesti: ${requiredHeaders.join(', ')}`
                    };
                    return;
                }
            }
            //console.log(csvData)
            if (type == 'network') {
                const requiredNetworkFields = [
                    'nomerete', 'descrizione', 'iprete', 'prefissorete', 'nomesito', 'citta', 'paese'
                ];
                if (!requiredNetworkFields.every(h => csvData.headers.includes(h))) {
                    feedbackSignal.value = {
                        message: `Header mancanti. Richiesti: ${requiredNetworkFields.join(', ')}`,
                        type: "error"
                    };
                    feedBackSVG[type] = {
                        type: "error",
                        message: `Header mancanti. Richiesti: ${requiredNetworkFields.join(', ')}`
                    };
                    return;
                }
            }
            if (type == 'ip') {
                const requiredIPFields = [
                    'nomerete', 'ipretenetwork', 'prefissoretenetwork', 'ip', 'n_prefisso', 'tipo_dispositivo', 'nome_dispositivo', 'brand_dispositivo'
                ];
                if (!requiredIPFields.every(h => csvData.headers.includes(h))) {
                    feedbackSignal.value = {
                        message: `Header mancanti. Richiesti: ${requiredIPFields.join(', ')}`,
                        type: "error"
                    };
                    feedBackSVG[type] = {
                        type: "error",
                        message: `Header mancanti. Richiesti: ${requiredIPFields.join(', ')}`
                    };
                    return;
                }
            }
            feedbackSignal.value = {
                message: `File csv caricato con successo!`,
                type: "success"
            };
            feedBackSVG[type] = {
                type: "success",
                message: "File csv caricato con successo!"
            };
            // Salva solo i metadati, non l'intero oggetto File
            files[type] = {
                name: file.name,
                size: file.size
            };
        } catch (err) {
            files[type] = null;
            feedbackSignal.value = {
                message: "Errore durante l'elaborazione del file",
                type: "error"
            };
            feedBackSVG[type] = {
                type: "error",
                message: "Errore durante l'elaborazione del file"
            };
            console.log(err)
        }
        setTimeout(() => (feedbackSignal.value = null), 2500);
    });

    const showPopUpCSV = $(() => {
        showModalCSV.value = true;
        //if (fileInputRefSiti.value) fileInputRefSiti.value.value = "";
        //if (fileInputRefNetwork.value) fileInputRefNetwork.value.value = "";
        //if (fileInputRefIP.value) fileInputRefIP.value.value = "";
        if (formRef.value) {
            formRef.value.reset();
        }
        files.network = null;
        files.ip = null;
        files.siti = null;
        sitiFeedback.value = null;
        networkFeedback.value = null;
        ipFeedback.value = null;
        clienteTXT.value = "";
        feedBackSVG['siti'] = null;
        feedBackSVG['network'] = null;
        feedBackSVG['ip'] = null;
        currentIdC.value = "";
        if (document.getElementById("clientTypeIDNew") != null)
            (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;
        if (document.getElementById("clientTypeIDExisting") != null)
            (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
        clientType.value = "new";
    })

    const reloadClients = $(async () => {
        addNotification(lang === "en" ? "Clients updating..." : "Clienti in aggiornamento...", 'loading');
        if (formAction.value?.success) {
            clientList.value = await listaClienti();
            showModalCSV.value = false;
            //if (fileInputRefSiti.value) fileInputRefSiti.value.value = "";
            //if (fileInputRefNetwork.value) fileInputRefNetwork.value.value = "";
            //if (fileInputRefIP.value) fileInputRefIP.value.value = "";
            if (formRef.value) {
                formRef.value.reset();
            }
            files.network = null;
            files.ip = null;
            files.siti = null;
            sitiFeedback.value = null;
            networkFeedback.value = null;
            ipFeedback.value = null;
            clienteTXT.value = "";
            feedBackSVG['siti'] = null;
            feedBackSVG['network'] = null;
            feedBackSVG['ip'] = null;
            currentIdC.value = "";
            if (document.getElementById("clientTypeIDNew") as HTMLInputElement != null)
                (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;
            if (document.getElementById("clientTypeIDExisting") as HTMLInputElement != null)
                (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
            clientType.value = "new";
            clientListRefresh.value++
            if (clientListRefresh.value > 255)
                clientListRefresh.value = 0;
            addNotification(lang === "en" ? "Insert completed" : "Inserimento completato", 'success');
        }
        else {
            addNotification(lang === "en" ? "Error during insert" : "Errore durante l'inserimento: " + formAction.value?.error, 'error');
        }

        notifications.value = notifications.value.filter(n => n.type !== "loading");
    })

    const showPreviewSection = $(async (section: 'siti' | 'network' | 'ip') => {
        viewTableSection.value = section
        showModalInfoCSV.value = true
    })

    // console.log(onclientinput, "E DI TIPO", typeof onclientinput)

    return (
        <>
            {/* Aggiungi questo div per le notifiche */}
            <div class="fixed top-8 left-1/2 z-50 flex flex-col items-center space-y-4 -translate-x-1/2">
                {notifications.value.map((notification, index) => (
                    <div
                        key={index}
                        class={[
                            "flex items-center gap-3 min-w-[320px] max-w-md rounded-xl px-6 py-4 shadow-2xl border-2 transition-all duration-300 text-base font-semibold",
                            notification.type === "success"
                                ? "bg-green-500/90 border-green-700 dark:bg-green-600 text-white"
                                : notification.type === "error"
                                    ? "bg-red-500/90 border-red-700 dark:bg-red-600 text-white"
                                    : "bg-white border-blue-400 text-blue-800"
                        ]}
                        style={{
                            filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.18))",
                            opacity: 0.98,
                        }}
                    >
                        {/* Icona */}
                        {notification.type === "success" && (
                            <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {notification.type === "error" && (
                            <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {notification.type === "loading" && (
                            <svg class="h-7 w-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                        )}

                        {/* Messaggio */}
                        <span class="flex-1">{notification.message}</span>
                    </div>
                ))}
            </div>

            <div class="size-full lg:px-40 md:px-24 sm:px-12 px-4">
                <Title>{t("dashboard.csv.clientSelection")}
                    <button onClick$={showPopUpCSV} class="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        {t("dashboard.csv.import")}
                    </button>
                </Title>
                <ClientList refresh={clientListRefresh.value} />


                {user.admin && (
                    <div class="flex items-center mt-4">
                        <div class="flex gap-1 hover:gap-2 cursor-pointer transition-all dark:hover:text-blue-400 items-center">

                            <button onClick$={() => nav(`/${lang}/admin/panel`)} class="cursor-pointer" >
                                {t("dashboard.gotoadmin")}
                            </button>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                class="mt-0.5 size-6"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                                />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            <PopupModal
                visible={showModalCSV.value}
                onClosing$={() => { showModalCSV.value = false }}
                title={
                    <div class="flex items-center gap-2 ">
                        <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{t("dashboard.csv.titleForm")}</span>
                        <span class="ml-2 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wide">CSV</span>
                    </div>}
            >
                <div
                    class="w-full flex justify-center items-center mb-2"
                    style={{
                        maxHeight: "80vh",
                        overflowY: "auto",
                    }}
                >
                    <Form action={formAction} onSubmit$={reloadClients} ref={formRef} class=" shadow-lg rounded-lg px-8 py-6 w-full max-w-2xl mx-auto space-y-6">
                        {/* Sezione Cliente - Modificata */}
                        <div class="space-y-4">
                            <h2 class="text-xl font-semibold">{t("dashboard.csv.subtitleForm")}</h2>
                            <div class="flex gap-4">
                                {/* Radio per scegliere tra nuovo cliente o esistente */}
                                <label class="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="clientType"
                                        value="new"
                                        checked
                                        class="form-radio text-blue-600"
                                        onChange$={() => {
                                            clientType.value = 'new';
                                            currentIdC.value = '';
                                        }}
                                        id="clientTypeIDNew"
                                    />
                                    {t("dashboard.csv.clientSelectNew")}
                                </label>

                                <label class="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="clientType"
                                        value="existing"
                                        class="form-radio text-blue-600"
                                        onChange$={() => {
                                            clientType.value = 'existing';
                                        }}
                                        id="clientTypeIDExisting"
                                    />
                                    {t("dashboard.csv.clientSelectExisting")}
                                </label>

                            </div>

                            {/* Input testo per nuovo cliente */}
                            {clientType.value === 'new' && (
                                <TextBoxForm
                                    error={formAction.value?.error}
                                    id="clienteTXTid"
                                    placeholder={t("dashboard.csv.placeholdercliente")}
                                    nameT="clienteTXT"
                                    title=""
                                    value={clienteTXT.value}
                                    onInput$={(event: InputEvent) => {
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                        if (event)
                                            clienteTXT.value = (event.target as HTMLInputElement).value;
                                    }}
                                />
                            )}
                            {/* Select per clienti esistenti */}
                            <input type="hidden" name="idcliente" id="idC" value={currentIdC.value} />
                            {clientType.value === 'existing' && (
                                <SelectForm
                                    value=""
                                    OnClick$={(e) => {
                                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                                        if (e) {
                                            const val = (e.target as HTMLSelectElement).value;
                                            currentIdC.value = val;
                                            (document.getElementsByName("idcliente")[0] as HTMLInputElement).value = val;
                                        }
                                    }}
                                    id="idUC"
                                    name="idcliente"
                                    title=""
                                    listName=""
                                >
                                    {clientList.value.map((row: any) => (
                                        <option value={row.idcliente} key={row.idcliente}>{row.nomecliente}</option>
                                    ))}
                                </SelectForm>
                            )}
                        </div>

                        <div class="space-y-4">
                            {/* Sezione SITI */}
                            <h2 class="text-xl font-semibold flex items-center gap-3">
                                <span class="flex items-center gap-2">
                                    {t('dashboard.csv.siti')}
                                    <button
                                        type="button"
                                        class="has-tooltip flex items-center justify-center w-7 h-7 rounded-full bg-black hover:bg-gray-800 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                                        onClick$={() => showPreviewSection('siti')}
                                    >
                                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                        </svg>
                                        <span class="tooltip">{t("dashboard.infotabella")}</span>
                                    </button>
                                </span>
                                <span class="inline-flex">
                                    {feedBackSVG.siti?.type === "success" && (
                                        <div class="has-tooltip">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-green-600">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            <span class="tooltip">Importazione avvenuta con successo</span>
                                        </div>
                                    )}
                                    {feedBackSVG.siti?.type === "error" && (
                                        <div class="has-tooltip">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-red-600">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                            </svg>
                                            <span class="tooltip">{feedBackSVG.siti?.message}</span>
                                        </div>
                                    )}
                                    {feedBackSVG.siti?.type === "loading" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-blue-600 animate-spin">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    )}
                                </span>
                            </h2>
                            <div class="relative">
                                <input
                                    disabled={clienteTXT.value.trim() === '' && currentIdC.value.trim() === ''}
                                    type="file"
                                    id="csv-siti"
                                    name="csvsiti"
                                    class="hidden"
                                    onChange$={(e) => handleUpload(e, sitiFeedback, 'siti')}
                                    accept=".csv"
                                />
                                <label
                                    for="csv-siti"
                                    class={`
                flex items-center justify-between px-6 py-4 rounded-lg transition-all 
                border-1 border-gray-200 bg-gray-50
                ${(!clienteTXT.value.trim() && !currentIdC.value.trim())
                                            ? 'cursor-not-allowed opacity-75'
                                            : 'cursor-pointer hover:bg-gray-100'}
            `}
                                >
                                    <div class="flex items-center gap-3">
                                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span class="text-gray-700">
                                            {files.siti ? files.siti.name : t("runtime.infoInput")}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="space-y-4">
                            {/* Sezione NETWORK */}
                            <h2 class="text-xl font-semibold flex items-center gap-3">
                                <span class="flex items-center gap-2">
                                    {t('dashboard.csv.network')}
                                    <button
                                        type="button"
                                        class="has-tooltip flex items-center justify-center w-7 h-7 rounded-full bg-black hover:bg-gray-800 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                                        onClick$={() => showPreviewSection('network')}
                                    >
                                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                        </svg>
                                        <span class="tooltip">{t("dashboard.infotabella")}</span>
                                    </button>
                                </span>
                                <span class="inline-flex">
                                    {feedBackSVG.network?.type === "success" && (
                                        <div class="has-tooltip">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-green-600">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            <span class="tooltip">Importazione avvenuta con successo</span>
                                        </div>
                                    )}
                                    {feedBackSVG.network?.type === "error" && (
                                        <div class="has-tooltip">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-red-600">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                            </svg>
                                            <span class="tooltip">{feedBackSVG.network?.message}</span>
                                        </div>
                                    )}
                                    {feedBackSVG.network?.type === "loading" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-blue-600 animate-spin">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    )}
                                </span>
                            </h2>
                            <div class="relative">
                                <input
                                    disabled={!files.siti}
                                    type="file"
                                    id="csv-network"
                                    name="csvnetwork"
                                    class="hidden"
                                    onChange$={(e) => handleUpload(e, sitiFeedback, 'network')}
                                    accept=".csv"
                                />
                                <label
                                    for="csv-network"
                                    class={`
                flex items-center justify-between px-6 py-4 rounded-lg transition-all 
                border-1 border-gray-200 bg-gray-50
                ${!files.siti
                                            ? 'cursor-not-allowed opacity-75'
                                            : 'cursor-pointer hover:bg-gray-100'}
            `}
                                >
                                    <div class="flex items-center gap-3">
                                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span class="text-gray-700">
                                            {files.network ? files.network.name : t("runtime.infoInput")}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="space-y-4">
                            {/* Sezione IP */}
                            <h2 class="text-xl font-semibold flex items-center gap-3">
                                <span class="flex items-center gap-2">
                                    {t('dashboard.csv.ip')}
                                    <button
                                        type="button"
                                        class="has-tooltip flex items-center justify-center w-7 h-7 rounded-full bg-black hover:bg-gray-800 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                                        onClick$={() => showPreviewSection('ip')}
                                    >
                                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                        </svg>
                                        <span class="tooltip">{t("dashboard.infotabella")}</span>
                                    </button>
                                </span>
                                <span class="inline-flex">
                                    {feedBackSVG.ip?.type === "success" && (
                                        <div class="has-tooltip">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-green-600">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                            <span class="tooltip">Importazione avvenuta con successo</span>
                                        </div>
                                    )}
                                    {feedBackSVG.ip?.type === "error" && (
                                        <div class="has-tooltip">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-red-600">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                            </svg>
                                            <span class="tooltip">{feedBackSVG.ip?.message}</span>
                                        </div>
                                    )}
                                    {feedBackSVG.ip?.type === "loading" && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-blue-600 animate-spin">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                    )}
                                </span>
                            </h2>
                            <div class="relative">
                                <input
                                    disabled={!files.network}
                                    type="file"
                                    id="csv-ip"
                                    name="csvip"
                                    class="hidden"
                                    onChange$={(e) => handleUpload(e, sitiFeedback, 'ip')}
                                    accept=".csv"
                                />
                                <label
                                    for="csv-ip"
                                    class={`
                flex items-center justify-between px-6 py-4 rounded-lg transition-all 
                border-1 border-gray-200 bg-gray-50
                ${!files.network
                                            ? 'cursor-not-allowed opacity-75'
                                            : 'cursor-pointer hover:bg-gray-100'}
            `}
                                >
                                    <div class="flex items-center gap-3">
                                        <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <span class="text-gray-700">
                                            {files.ip ? files.ip.name : t("runtime.infoInput")}
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>



                        <button
                            type="submit"
                            class="w-full py-3 px-6 bg-gray-600 dark:bg-gray-900 dark:not-disabled:bg-gray-950 dark:hover:not-disabled:bg-800 text-white rounded-lg duration-250 transition-all cursor-pointer not-disabled:bg-gray-800 disabled:cursor-not-allowed"
                            disabled={
                                (clientType.value === 'new' && clienteTXT.value.trim() === '') ||
                                (clientType.value === 'existing' && currentIdC.value.trim() === '')
                            }
                        >
                            {t("dashboard.csv.confirmImport")}
                        </button>
                        <button
                            type="button"
                            onClick$={() => {
                                if (formRef.value) {
                                    formRef.value.reset();
                                }
                                showModalCSV.value = false;
                                files.network = null;
                                files.ip = null;
                                files.siti = null;
                                sitiFeedback.value = null;
                                networkFeedback.value = null;
                                ipFeedback.value = null;
                                clienteTXT.value = "";
                                feedBackSVG['siti'] = null;
                                feedBackSVG['network'] = null;
                                feedBackSVG['ip'] = null;
                                currentIdC.value = "";
                                if (document.getElementById("clientTypeIDNew") as HTMLInputElement != null)
                                    (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;
                                if (document.getElementById("clientTypeIDExisting") as HTMLInputElement != null)
                                    (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
                                clientType.value = "new";
                            }}
                            class="w-full py-3 px-6 bg-white dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg hover:bg-gray-200 transition-all border duration-250 border-gray-300 cursor-pointer"
                        >
                            {t("dashboard.csv.cancel")}
                        </button>
                    </Form>

                </div>
            </PopupModal>

            <PopupModal
                visible={showModalInfoCSV.value}
                title={
                    <div class="flex items-center gap-2">
                        <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{t("dashboard.csv.titleInfoCSV")}</span>
                        <span class="ml-2 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wide">CSV</span>
                    </div>
                }
                onClosing$={() => { showModalInfoCSV.value = false; }}
            >
                {viewTableSection.value != null && (
                    <TableInfoCSV tableName={viewTableSection.value as string}></TableInfoCSV>
                )}

            </PopupModal>

        </>
    )
})

export const head: DocumentHead = {
    title: "Dashboard",
    meta: [
        {
            name: "Pagina iniziale",
            content: "Pagina iniziale dell'applicazione IPAM",
        },
    ],
};