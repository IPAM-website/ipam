import { $, component$, getLocale, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { RequestHandler, useNavigate, routeLoader$, DocumentHead, routeAction$, zod$, z, RequestEventAction, RequestEvent, Form } from "@builder.io/qwik-city";
import ClientList from "~/components/ListUtilities/ClientList/ClientList";
import Title from "~/components/layout/Title";
import PopupModal from "~/components/ui/PopupModal";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import { getBaseURL, getUser } from "~/fnUtils";
import { ClienteModel, TecnicoModel } from "~/dbModels";
import { parseCSV } from "~/components/utils/parseCSV";
import sql from "../../../../db";
import { listaClienti } from "../admin/panel/utenti_clienti";
import { time } from "node:console";

/*const clientSchema = z.object({
    clientType: z.enum(['new', 'existing']),
    clienteTXT: z.string().optional(),
    clientId: z.string().optional(),
    idcliente: z.string().optional(),
    csvsiti: z.instanceof(File).optional(),
    csvnetwork: z.instanceof(File).optional(),
    csvip: z.instanceof(File).optional(),
}).refine(
    (data) =>
        (data.clientType === 'new' && data.clienteTXT) ||
        (data.clientType === 'existing' && data.clientId && data.idcliente && data.csvsiti && data.csvnetwork && data.csvip),
    {
        message: "Seleziona o crea un cliente",
        path: ['clientType']
    }
);*/

export const CSVInsert = routeAction$(async (data, requestEvent: RequestEventAction) => {
    try {
        console.log("Dati validati:", data);
    } catch (e) {
        console.log(e)
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
    const importState = useStore({
        cliente: '',
        files: {
            siti: null as File | null,
            network: null as File | null,
            ip: null as File | null,
        },
        validation: {
            siti: { valid: false, error: '' },
            network: { valid: false, error: '' },
            ip: { valid: false, error: '' },
        },
        isSubmitting: false,
    });
    // Stati di feedback per ogni sezione
    const sitiFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const networkFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const ipFeedback = useSignal<null | { message: string; type: "success" | "error" }>(null);
    const currentIdC = useSignal('');
    const clientList = useSignal<ClienteModel[]>([]);
    const fileInputRefSiti = useSignal<HTMLInputElement>();
    const fileInputRefNetwork = useSignal<HTMLInputElement>();
    const fileInputRefIP = useSignal<HTMLInputElement>();
    const feedBackSVG = useStore<{ [key: string]: { type: string; message?: string } | null }>({
        siti: null,
        network: null,
        ip: null,
    });

    const user: TecnicoModel = useUser().value;
    const showModalCSV = useSignal(false);
    const formAction = CSVInsert();
    const clientType = useSignal<'new' | 'existing'>('new');
    const selectedClient = useSignal('');
    const files = useStore<{ [key: string]: File | null }>({
        siti: null,
        network: null,
        ip: null,
    });

    useTask$(async ({ track }) => {
        clientList.value = await listaClienti();
        track(() => showModalCSV.value);
        track(() => formAction.value);
        if (formAction.value?.failed) {
            importState.files.siti = null;
            importState.files.network = null;
            importState.files.ip = null;
            importState.validation.siti.valid = false;
            importState.validation.network.valid = false;
            importState.validation.ip.valid = false;
            importState.validation.siti.error = '';
            importState.validation.network.error = '';
            importState.validation.ip.error = '';
            sitiFeedback.value = null;
            networkFeedback.value = null;
            ipFeedback.value = null;
            currentIdC.value = '';
            clientType.value = 'new';
            selectedClient.value = '';
            Object.keys(feedBackSVG).forEach((key) => {
                feedBackSVG[key] = null;
            });
            /*(document.getElementById("idC") as HTMLInputElement).value = '';
            (document.getElementById("clienteTXTid") as HTMLInputElement).value = '';
            (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
            (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;*/
            if (fileInputRefIP.value) fileInputRefIP.value.value = '';
            if (fileInputRefNetwork.value) fileInputRefNetwork.value.value = '';
            if (fileInputRefSiti.value) fileInputRefSiti.value.value = '';
        }
        if (showModalCSV.value) {
            importState.files.siti = null;
            importState.files.network = null;
            importState.files.ip = null;
            importState.validation.siti.valid = false;
            importState.validation.network.valid = false;
            importState.validation.ip.valid = false;
            importState.validation.siti.error = '';
            importState.validation.network.error = '';
            importState.validation.ip.error = '';
            sitiFeedback.value = null;
            networkFeedback.value = null;
            ipFeedback.value = null;
            currentIdC.value = '';
            clientType.value = 'new';
            selectedClient.value = '';
            Object.keys(feedBackSVG).forEach((key) => {
                feedBackSVG[key] = null;
            });
            (document.getElementById("idC") as HTMLInputElement).value = '';
            (document.getElementById("clienteTXTid") as HTMLInputElement).value = '';
            (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
            (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;
            if (fileInputRefIP.value) fileInputRefIP.value.value = '';
            if (fileInputRefNetwork.value) fileInputRefNetwork.value.value = '';
            if (fileInputRefSiti.value) fileInputRefSiti.value.value = '';
        }
    })

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

            if (!file || file.size === 0) { // <--- Controllo dimensione file
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

            /*const requiredHeaders = ['nomeSito', 'nomeCitta', 'nomePaese', 'datacenter', 'tipologia', 'nomeCliente'];
            if (!requiredHeaders.every(h => csvData.headers.includes(h))) {
                feedbackSignal.value = {
                    message: `Header mancanti. Richiesti: ${requiredHeaders.join(', ')}`,
                    type: "error"
                };
                return;
            }*/
            feedbackSignal.value = {
                message: `File csv caricato con successo!`,
                type: "success"
            };
            feedBackSVG[type] = {
                type: "success",
                message: "File csv caricato con successo!"
            };
        } catch (err) {
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
        if (fileInputRefIP.value) fileInputRefIP.value.value = '';
        if (fileInputRefNetwork.value) fileInputRefNetwork.value.value = '';
        if (fileInputRefSiti.value) fileInputRefSiti.value.value = '';
        showModalCSV.value = true
    })

    return (
        <>
            <div class="size-full lg:px-40 px-24">
                <Title>{$localize`: @@dbTitle:Client Selection Page`}
                    <button onClick$={showPopUpCSV} class="cursor-pointer inline-flex items-center gap-1 px-2 py-1 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm ml-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        {$localize`Import CSV`}
                    </button>
                </Title>
                <ClientList />


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
                    <Form action={formAction} class="bg-white shadow-lg rounded-lg px-8 py-6 w-full max-w-2xl mx-auto space-y-6">
                        {/* Sezione Cliente - Modificata */}
                        <div class="space-y-4">
                            <h2 class="text-xl font-semibold">Cliente</h2>

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
                                <input
                                    type="text"
                                    name="clienteTXT"
                                    class="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Nome nuovo cliente"
                                    id="clienteTXTid"
                                />)}

                            {/* Select per clienti esistenti */}
                            <input type="hidden" name="idcliente" id="idC" value={currentIdC.value} />
                            {clientType.value === 'existing' && (
                                <SelectForm
                                    value=""
                                    OnClick$={(e) => {
                                        (document.getElementsByName("idcliente")[0] as HTMLInputElement).value = (e.target as HTMLOptionElement).value;
                                    }}
                                    id="idUC"
                                    name="idcliente"
                                    title={$localize`Cliente`}
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
                                <h2 class="text-xl font-semibold flex items-center gap-2">Importa {section}
                                    <span class="inline-flex ">
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
                                        type="file"
                                        id={`csv-${section}`}
                                        name={`csv${section}`}
                                        class="hidden"
                                        onChange$={(e) => handleUpload(e, sitiFeedback, section as 'siti' | 'network' | 'ip')}
                                        accept=".csv"
                                        ref={section === 'siti' ? fileInputRefSiti : section === 'network' ? fileInputRefNetwork : fileInputRefIP}
                                    />

                                    <label
                                        htmlFor={`csv-${section}`}
                                        class="flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
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
                            class="w-full py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 duration-250 transition-all cursor-pointer"
                            disabled={importState.validation.siti.valid || (importState.validation.network.valid && importState.validation.siti.valid) || (importState.validation.siti.valid && importState.validation.network.valid && importState.validation.ip.valid)}
                        >
                            Conferma Importazione
                        </button>
                        <button
                            type="button"
                            class="w-full py-3 px-6 bg-white  rounded-lg hover:bg-gray-200 transition-all border duration-250 border-gray-300 cursor-pointer"
                            onClick$={() => {
                                showModalCSV.value = false;
                                importState.files.siti = null;
                                importState.files.network = null;
                                importState.files.ip = null;
                                importState.validation.siti.valid = false;
                                importState.validation.network.valid = false;
                                importState.validation.ip.valid = false;
                                importState.validation.siti.error = '';
                                importState.validation.network.error = '';
                                importState.validation.ip.error = '';
                                sitiFeedback.value = null;
                                networkFeedback.value = null;
                                ipFeedback.value = null;
                                currentIdC.value = '';
                                clientType.value = 'new';
                                selectedClient.value = '';
                                Object.keys(feedBackSVG).forEach((key) => {
                                    feedBackSVG[key] = null;
                                });
                                (document.getElementById("idC") as HTMLInputElement).value = '';
                                (document.getElementById("clienteTXTid") as HTMLInputElement).value = '';
                                (document.getElementById("clientTypeIDExisting") as HTMLInputElement).checked = false;
                                (document.getElementById("clientTypeIDNew") as HTMLInputElement).checked = true;
                                if (fileInputRefIP.value) fileInputRefIP.value.value = '';
                                if (fileInputRefNetwork.value) fileInputRefNetwork.value.value = '';
                                if (fileInputRefSiti.value) fileInputRefSiti.value.value = '';
                            }}
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