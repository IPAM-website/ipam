import { $, component$, getLocale, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { RequestHandler, useNavigate, routeLoader$, DocumentHead, routeAction$, zod$, z, RequestEventAction, RequestEvent, Form } from "@builder.io/qwik-city";
import ClientList from "~/components/ListUtilities/ClientList/ClientList";
import Title from "~/components/layout/Title";
import PopupModal from "~/components/ui/PopupModal";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import TextBoxForm from "~/components/forms/formsComponents/TextboxForm";
import { getBaseURL, getUser } from "~/fnUtils";
import { ClienteModel, TecnicoModel } from "~/dbModels";
import { parseCSV } from "~/components/utils/parseCSV";
import sql from "../../../../db";
import { listaClienti } from "../admin/panel/utenti_clienti";
import countries from 'i18n-iso-countries';
import it from 'i18n-iso-countries/langs/it.json';
import { CSVInfoDashboardDBTableMaps } from "~/tableMaps";
import BtnInfoTable from "~/components/table/btnInfoTable";

type Notification = {
    message: string;
    type: 'success' | 'error';
};

export const CSVInsert = routeAction$(async (data, requestEvent: RequestEventAction) => {
    const translateCountry = (input: string): string => {
        const code = countries.getAlpha2Code(input, 'it'); // Cerca in italiano
        if (!code) throw new Error(`Paese non riconosciuto: ${input}`);
        return countries.getName(code, 'en')!; // Restituisce nome in inglese
    };
    try {
        let idClientePrivate: number | undefined;
        //console.log("Dati validati:", data);

        if (data.clientType == "existing" && data.csvsiti == undefined && data.csvnetwork == undefined && data.csvip == undefined)
            return { error: "Errore durante l'importazione", success: false }
        // Caricamento/Ricerca cliente
        if (data.clientType == "new" && data.clienteTXT != undefined && data.clienteTXT != "") {
            let clienteExist = await sql`SELECT * FROM clienti WHERE nomecliente = ${data.clienteTXT}`
            if (clienteExist.length != 0)
                idClientePrivate = clienteExist[0].idcliente
            else {
                await sql`INSERT INTO clienti (nomecliente) VALUES (${data.clienteTXT})`
                const result = await sql`SELECT idcliente FROM clienti WHERE nomecliente = ${data.clienteTXT}`
                idClientePrivate = result[0].idcliente
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
            //console.log(rows)
            for (let i = 1; i < rows.length; i++) {
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
                        cittaResult = await sql`
                            INSERT INTO citta (nomecitta, idpaese)
                            VALUES (${citta}, ${idPaese})
                            RETURNING idcitta
                        `;
                        idCitta = cittaResult[0].idcitta;
                    } else {
                        idCitta = cittaResult[0].idcitta;
                    }

                    // 3. Inserisci sito
                    if (idClientePrivate === undefined) {
                        return { error: `Cliente non trovato`, success: false }
                    }
                    await sql`
                        INSERT INTO siti (nomesito, idcitta, datacenter, tipologia, idcliente)
                        VALUES (${nomeSito}, ${idCitta}, ${datacenter}, ${tipologia}, ${idClientePrivate})
                    `;
                } catch (err) {
                    return { error: `Riga ${i}: ${err}`, success: false }
                }
            }
        }
        else
            return { error: "Errore durante l'importazione dei siti", success: false };



        return { success: true }
    } catch (e) {
        console.log(e)
        return { error: "Errore durante l'importazione", success: false }
    }
}, zod$({
    clientType: z.enum(['new', 'existing']),
    clienteTXT: z.string().optional(),
    idcliente: z.string().optional(),
    csvsiti: z.instanceof(File).optional(),
    csvnetwork: z.instanceof(File).optional(),
    csvip: z.instanceof(File).optional(),
}))


export const onRequest: RequestHandler = async ({ cookie, redirect, sharedMap }) => {
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
    catch (e) {
        throw redirect(302, getBaseURL() + "login");
    }
    if (correct != "")
        throw redirect(301, getBaseURL() + correct);
};

export const useUser = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('user') as TecnicoModel;
});

export default component$(() => {
    const clientListRefresh = useSignal(0);
    const showInfoTable = useStore<{ [key: string]: boolean }>({
        siti: false,
        network: false,
        ip: false,
    });
    const lang = getLocale("en")
    // Stati di feedback per ogni sezione
    const sitiFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const networkFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const ipFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const currentIdC = useSignal('');
    const clientList = useSignal<ClienteModel[]>([]);
    const fileInputRefSiti = useSignal<HTMLInputElement>();
    const fileInputRefNetwork = useSignal<HTMLInputElement>();
    const fileInputRefIP = useSignal<HTMLInputElement>();
    const notifications = useSignal<Notification[]>([]);
    const feedBackSVG = useStore<{ [key: string]: { type: string; message?: string } | null }>({
        siti: null,
        network: null,
        ip: null,
    });

    const clienteTXT = useSignal('');
    const user: TecnicoModel = useUser().value;
    const showModalCSV = useSignal(false);
    const formAction = CSVInsert();
    const clientType = useSignal<'new' | 'existing'>('new');
    const files = useStore<{ [key: string]: { name: string; size: number } | null }>({
        siti: null,
        network: null,
        ip: null,
    });

    useTask$(async ({ track }) => {
        track(() => clientType.value);
        track(() => formAction.value);
        track(() => clientList.value);
    })

    const addNotification = $((message: string, type: 'success' | 'error') => {
        notifications.value = [...notifications.value, { message, type }];
        // Rimuovi la notifica dopo 3 secondi
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.message !== message);
        }, 3000);
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
                addNotification("Nessun file selezionato", 'error');
                return;
            }

            // Verifica estensione e tipo file
            if (!file.name.endsWith('.csv') || !['text/csv', 'application/vnd.ms-excel'].includes(file.type)) {
                feedbackSignal.value = { message: "Il file deve essere un CSV", type: "error" };
                feedBackSVG[type] = {
                    type: "error",
                    message: "Il file deve essere un CSV"
                };
                addNotification("Il file deve essere un CSV", 'error');
                return;
            }

            if (!file || file.size === 0) { // <--- Controllo dimensione file
                feedbackSignal.value = { message: "Il file e' vuoto", type: "error" };
                feedBackSVG[type] = {
                    type: "error",
                    message: "Il file e' vuoto"
                };
                addNotification("Il file e' vuoto", 'error');
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
                addNotification("Il file CSV è vuoto", 'error');
                return;
            }

            if (type == 'siti') {
                const requiredHeaders = ['nomeSito', 'citta', 'paese', 'datacenter', 'tipologia'];
                if (!requiredHeaders.every(h => csvData.headers.includes(h))) {
                    feedbackSignal.value = {
                        message: `Header mancanti. Richiesti: ${requiredHeaders.join(', ')}`,
                        type: "error"
                    };
                    feedBackSVG[type] = {
                        type: "error",
                        message: `Header mancanti. Richiesti: ${requiredHeaders.join(', ')}`
                    };
                    addNotification(`Header mancanti. Richiesti: ${requiredHeaders.join(', ')}`, 'error');
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
            if (file) {
                // Salva solo i metadati, non l'intero oggetto File
                files[type] = {
                    name: file.name,
                    size: file.size
                };
            }
            addNotification("File caricato con successo", 'success');
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
            addNotification("Errore durante l'elaborazione del file", 'error');
            console.log(err)
        }
        setTimeout(() => (feedbackSignal.value = null), 2500);
    });

    const showPopUpCSV = $(() => {
        files['siti'] = null;
        files['network'] = null;
        files['ip'] = null;
        showModalCSV.value = false;
        fileInputRefIP.value = undefined;
        fileInputRefNetwork.value = undefined;
        fileInputRefSiti.value = undefined;
        sitiFeedback.value = null;
        networkFeedback.value = null;
        ipFeedback.value = null;
        clienteTXT.value = "";
        feedBackSVG['siti'] = null;
        feedBackSVG['network'] = null;
        feedBackSVG['ip'] = null;
        currentIdC.value = "";
        (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;
        (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
        clientType.value = "new";
        showModalCSV.value = true
    })

    const reloadClients = $(async () => {
        if (formAction.value?.success) {
            clientList.value = await listaClienti();

            showModalCSV.value = false;
            files['siti'] = null;
            files['network'] = null;
            files['ip'] = null;
            fileInputRefIP.value = undefined;
            fileInputRefNetwork.value = undefined;
            fileInputRefSiti.value = undefined;
            sitiFeedback.value = null;
            networkFeedback.value = null;
            ipFeedback.value = null;
            clienteTXT.value = "";
            feedBackSVG['siti'] = null;
            feedBackSVG['network'] = null;
            feedBackSVG['ip'] = null;
            currentIdC.value = "";
            (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;
            (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
            clientType.value = "new";
            clientListRefresh.value++
            if (clientListRefresh.value > 255)
                clientListRefresh.value = 0;
            addNotification(lang === "en" ? "Record edited successfully" : "Dato modificato con successo", 'success');
        }
        else
            addNotification(formAction.value?.error ?? "Errore durante la modifica", 'error');
    })

    const showPreviewSection = $(async (section: 'siti' | 'network' | 'ip') => {

    })

    return (
        <>
            {/* Aggiungi questo div per le notifiche */}
            <div class="fixed top-4 right-4 z-50 space-y-2">
                {notifications.value.map((notification, index) => (
                    <div
                        key={index}
                        class={`p-4 rounded-md shadow-lg ${notification.type === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}
                    >
                        {notification.message}
                    </div>
                ))}
            </div>
            <div class="size-full lg:px-40 px-24">
                <Title>{$localize`: @@dbTitle:Client Selection Page`}
                    <button onClick$={showPopUpCSV} class="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        {$localize`Import CSV`}
                    </button>
                </Title>
                <ClientList refresh={clientListRefresh.value} />


                {user.admin && (
                    <div class="flex gap-1 items-center mt-4">
                        <a href={`/${getLocale("en")}/admin/panel`} class="hover:underline">
                            {$localize`Go to admin options`}
                        </a>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="mt-0.5 size-4"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                            />
                        </svg>
                    </div>
                )}
            </div>

            <PopupModal
                visible={showModalCSV.value}
                onClosing$={() => { showModalCSV.value = false }}
                title={<div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Importazioni di cliente, sito, network e  IP</span>
                    <span class="ml-2 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wide">CSV</span>
                </div>}
            >
                <div class="w-full flex justify-center items-center">
                    <Form action={formAction} onSubmit$={reloadClients} class="bg-white shadow-lg rounded-lg px-8 py-6 w-full max-w-2xl mx-auto space-y-6">
                        {/* Sezione Cliente - Modificata */}
                        <div class="space-y-4">
                            <h2 class="text-xl font-semibold">Cliente</h2>
                            Trascina
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
                                    Crea nuovo cliente
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
                                    Seleziona esistente
                                </label>
                            </div>

                            {/* Input testo per nuovo cliente */}
                            {clientType.value === 'new' && (
                                <TextBoxForm
                                    error={formAction.value?.error}
                                    id="clienteTXTid"
                                    placeholder={$localize`Inserire il nome del cliente`}
                                    nameT="clienteTXT"
                                    title=""
                                    value={clienteTXT.value}
                                    OnInput$={(event: InputEvent) => {
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
                                        const val = (e.target as HTMLSelectElement).value;
                                        currentIdC.value = val;
                                        (document.getElementsByName("idcliente")[0] as HTMLInputElement).value = val;
                                    }}
                                    id="idUC"
                                    name="idcliente"
                                    title=""
                                    listName=""
                                >
                                    {clientList.value && clientList.value?.map((row: any) => (
                                        <option value={row.idcliente}>{row.nomecliente}</option>
                                    ))}
                                </SelectForm>
                            )}
                        </div>

                        {/* Sezione File con feedback visivo */}
                        {['siti', 'network', 'ip'].map((section) => (
                            <div key={section} class="space-y-4">
                                <h2 class="text-xl font-semibold flex items-center gap-3">
                                    <span class="flex items-center gap-2">
                                        Importa {section}
                                        <button
                                            type="button"
                                            class="has-tooltip flex items-center justify-center w-7 h-7 rounded-full bg-black hover:bg-gray-800 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                                            onClick$={() => showPreviewSection(section as 'siti' | 'network' | 'ip')}
                                        >
                                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                                            </svg>
                                            <span class="tooltip">
                                                {$localize`Info tabella`}
                                            </span>
                                        </button>
                                    </span>

                                    <span class="inline-flex">
                                        {feedBackSVG[section]?.type === "success" && (
                                            <div class="has-tooltip">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-green-600">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                </svg>
                                                <span class="tooltip">Importazione avvenuta con successo</span>
                                            </div>
                                        )}
                                        {feedBackSVG[section]?.type === "error" && (
                                            <div class="has-tooltip">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-red-600">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                                                </svg>
                                                <span class="tooltip">{feedBackSVG[section]?.message}</span>
                                            </div>
                                        )}
                                        {feedBackSVG[section]?.type === "loading" && (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 text-blue-600 animate-spin">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                                            </svg>
                                        )}
                                    </span>
                                </h2>

                                <div class="relative">
                                    <input
                                        disabled={section === 'siti' && clienteTXT.value.trim() === '' && currentIdC.value.trim() === ''
                                            || section === 'network' && !files.siti
                                            || section === 'ip' && !files.network}
                                        type="file"
                                        id={`csv-${section}`}
                                        name={`csv${section}`}
                                        class="hidden"
                                        onChange$={(e) => handleUpload(e, sitiFeedback, section as 'siti' | 'network' | 'ip')}
                                        accept=".csv"
                                    />

                                    <label
                                        htmlFor={`csv-${section}`}
                                        class={`
                                                flex items-center justify-between px-6 py-4 rounded-lg transition-all 
                                                border-1 border-gray-200 bg-gray-50
                                                ${(section === 'siti' && !clienteTXT.value.trim() && !currentIdC.value.trim())
                                                || (section === 'network' && !files.siti)
                                                || (section === 'ip' && !files.network)
                                                ? 'cursor-not-allowed opacity-75'
                                                : 'cursor-pointer hover:bg-gray-100'}
        `}
                                    >
                                        <div class="flex items-center gap-3">
                                            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                            <span class="text-gray-700">
                                                {files[section] ? files[section].name : `Trascina CSV o clicca per selezionare`}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        ))}


                        <button
                            type="submit"
                            class="w-full py-3 px-6 bg-gray-600 text-white rounded-lg duration-250 transition-all cursor-pointer not-disabled:bg-gray-800 disabled:cursor-not-allowed"
                            disabled={
                                (clientType.value === 'new' && clienteTXT.value.trim() === '') ||
                                (clientType.value === 'existing' && currentIdC.value.trim() === '')
                            }
                        >
                            Conferma Importazione
                        </button>
                        <button
                            type="button"
                            onClick$={() => {
                                files['siti'] = null;
                                files['network'] = null;
                                files['ip'] = null;
                                showModalCSV.value = false;
                                fileInputRefIP.value = undefined;
                                fileInputRefNetwork.value = undefined;
                                fileInputRefSiti.value = undefined;
                                sitiFeedback.value = null;
                                networkFeedback.value = null;
                                ipFeedback.value = null;
                                clienteTXT.value = "";
                                feedBackSVG['siti'] = null;
                                feedBackSVG['network'] = null;
                                feedBackSVG['ip'] = null;
                                currentIdC.value = "";
                                (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;
                                (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
                                clientType.value = "new";
                            }}
                            class="w-full py-3 px-6 bg-white  rounded-lg hover:bg-gray-200 transition-all border duration-250 border-gray-300 cursor-pointer"
                        >
                            Annulla
                        </button>
                    </Form>

                </div>
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