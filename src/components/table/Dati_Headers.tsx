import { component$, getLocale, useSignal, useTask$, useStore, $, useStyles$, useVisibleTask$, Slot } from "@builder.io/qwik";
import TableMaps from "./tableMaps";
import { server$ } from "@builder.io/qwik-city";
import sql from "~/../db";
import tableStyle from "./tableStyle.css?inline";
import ConfirmDialog from "~/components/ui/confirmDialog";
import postgres from "postgres";

interface LoaderState { [key: string]: boolean; }
interface DatiProps { dati: any, title?: string, nomeTabella: string, OnModify?: (row: any) => void; OnDelete?: (row: any) => void; DBTabella: string; funcReloadData?: () => any, onReloadRef?: (reloadFunc : ()=>void)=>void }


export default component$<DatiProps>(({ dati: initialData, title = "TABELLA", nomeTabella, OnModify, OnDelete = () => { }, DBTabella, funcReloadData, onReloadRef }) => {
    const modificaIT_EN = ["Modifica", "Edit"];
    const showDialog = useSignal(false);
    const rowToDelete = useSignal<any>(null);
    useStyles$(tableStyle);
    const nT = useSignal(DBTabella);
    const lang = getLocale("en");

    const store = useStore({
        dati: Array.isArray(initialData) ? [...initialData] : [],
        error: null as string | null,
        globalLoading: false
    });

    const reloadData = $(async () => {
        store.globalLoading = true;
        try {
            console.log("Reloading data for table:", nT.value);
            const freshData = funcReloadData ? await funcReloadData() : await server$(async () => {
                const result = await sql`SELECT * FROM ${sql(nT.value)}`;
                return Array.isArray(result) ? result : [];
            })();

            // if (funcReloadData) {
            //     console.log("Personalized reload function");
            //     console.log("Data: ",await funcReloadData())
            // }
            store.dati = freshData;
        } catch (error) {
            showError(lang === 'it'
                ? "Errore durante il caricamento"
                : "Error during loading");
        } finally {
            store.globalLoading = false;
        }
    });

    const loadingStates = useStore<LoaderState>({});
    const rowIDC = useSignal<string | number | null>(null);
    const errorTimeout = useSignal<ReturnType<typeof setTimeout>>();
    const initialLoad = useSignal(true);

    if (!Array.isArray(initialData)) {
        return <div class="text-gray-500 text-center p-8 border-t border-neutral-200">Non sono presenti tecnici nella tabella</div>;
    }

    useVisibleTask$(async () => {
        //await new Promise(resolve => setTimeout(resolve, 1500)); --> timer qwik
        initialLoad.value = false;
        if(onReloadRef)
            onReloadRef(reloadData);
    });

    const showError = $((message: string) => {
        store.error = message;
        if (errorTimeout.value) clearTimeout(errorTimeout.value);
        errorTimeout.value = setTimeout(() => store.error = null, 5000);
    });

    useVisibleTask$(({ cleanup }) => {
        cleanup(() => {
            if (errorTimeout.value) clearTimeout(errorTimeout.value);
        });
    });


    const handleDelete = $(async (row: any) => {
        rowToDelete.value = row;
        showDialog.value = true;
    });

    const confirmDelete = $(async () => {
        if (!rowToDelete.value) return;

        const row = rowToDelete.value;
        const rowId = row[TableMaps[nT.value].keys[0]];
        rowIDC.value = rowId;
        loadingStates[rowId] = true;
        showDialog.value = false;

        //await new Promise(resolve => setTimeout(resolve, 10000));

        // Aggiornamento ottimistico
        store.dati = store.dati.filter(item =>
            item[TableMaps[nT.value].keys[0]] !== rowId
        );

        //const result = await CRUDRow(row, nT.value, nomeTabella);

        /*if (result?.errore) {
            store.dati = [...store.dati, row];
            showError(lang === 'it' 
                ? "Errore durante l'eliminazione" 
                : "Error during deletion");
        }else {
            // Ricarica i dati dal server per sincronizzazione
            await reloadData();
        }*/

        loadingStates[rowId] = false;

        OnDelete(row);
    });

    const cancelDelete = $(() => {
        showDialog.value = false;
        rowToDelete.value = null;
    });


    return (
        <>
            {/* Pulsante Ricarica */}
            <div class="flex items-center mb-4 px-1 pe-3">

                <div class="flex-auto m-5 text-black text-base font-semibold font-['Inter']">
                    {title}
                </div>
                <button
                    id="btnReload"
                    onClick$={reloadData}
                    disabled={store.globalLoading}
                    class={`flex items-center px-4 py-2 rounded-md 
                ${store.globalLoading
                            ? 'bg-gray-400 cursor-wait'
                            : 'bg-gray-800 hover:bg-gray-900 text-white cursor-pointer'}
                transition-colors`}
                >
                    {store.globalLoading ? (
                        <>
                            <div class="loader-spinner-small mr-2"></div>
                            {lang === 'en' ? 'Loading...' : 'Caricamento...'}
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                            {$localize`Ricarica`}
                        </>
                    )}
                </button>
            </div>
            <div class="w-11/12 mx-auto">



                {/* Messaggio di errore con progress bar */}
                {store.error && (
                    <div class="bg-red-100 text-red-700 p-3 mb-4 rounded-lg shadow relative">
                        {store.error}
                        <div class="absolute bottom-0 left-0 h-1 bg-red-300 animate-progress"></div>
                    </div>
                )}

                {/* Skeleton loading durante caricamento iniziale */}
                {initialLoad.value ? (
                    <div class="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} class="flex border-t border-neutral-200">
                                {TableMaps[nT.value].keys.map((_, j) => (
                                    <div key={j} class="p-4 flex-1">
                                        <div class="skeleton h-6 w-full rounded"></div>
                                    </div>
                                ))}
                                <div class="p-4 flex-1">
                                    <div class="skeleton h-8 w-8 rounded-md inline-block"></div>
                                    <div class="skeleton h-8 w-8 ml-2 rounded-md inline-block"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {/* Intestazioni della tabella */}
                        <div class="flex bg-gray-50 rounded-t-lg">
                            {TableMaps[nT.value].headers[lang].map((header, index) => (
                                <div key={index} class="text-zinc-500 text-sm font-semibold py-3 px-4 flex-1">
                                    {header}
                                </div>
                            ))}
                        </div>

                        {/* Righe della tabella */}
                        {
                            Array.isArray(store.dati) && store.dati.length > 0 ? (
                                store.dati.map((row, rowIndex) => (
                                    <div key={rowIndex} class="flex border-t border-neutral-200 hover:bg-gray-50 transition-colors">
                                        {TableMaps[nT.value].keys.map((key, colIndex) => (
                                            <div key={colIndex} class="text-black text-base font-medium font-['Inter'] leading-normal p-4 flex-1">
                                                {row[key] || "N/A"}
                                            </div>
                                        ))}
                                        <div class="text-black text-base font-medium font-['Inter'] leading-normal p-4 flex-1">
                                            {/* Pulsante Modifica */}
                                            <button class="bg-amber-500 w-8 h-8 rounded-md inline-flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors has-tooltip"
                                                onClick$={() => OnModify?.(row)}>
                                                <span class="tooltip">{lang === 'it' ? modificaIT_EN[0] : modificaIT_EN[1]}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-5 h-5">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                            </button>



                                            {/* Pulsante Elimina */}
                                            <button class={`relative w-8 h-8 rounded-md ml-2 inline-flex items-center justify-center has-tooltip
                                            ${loadingStates[row[TableMaps[nT.value].keys[0]]] ? 'bg-red-400 cursor-wait' : 'bg-red-500 hover:bg-red-600 cursor-pointer'} transition-colors`}
                                                onClick$={() => handleDelete(row)}
                                                disabled={loadingStates[row[TableMaps[nT.value].keys[0]]]}>
                                                <span class="tooltip">{$localize`Elimina`}</span>
                                                {loadingStates[row[TableMaps[nT.value].keys[0]]] ? (
                                                    <div class="loader-spinner"></div>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-5 h-5">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div class="text-gray-500 text-center p-8 border-t border-neutral-200">
                                    {$localize`Non sono presenti ${nomeTabella} nella tabella`}
                                </div>
                            )
                        }
                    </>
                )}
            </div>
            {/* Dialog di conferma eliminazione */}
            <ConfirmDialog
                isOpen={showDialog.value}
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                title={$localize`Conferma`}
                message={$localize`Sei sicuro di voler procedere?`}
                confirmText={$localize`Elimina`}
                cancelText={$localize`Annulla`}
            />
        </>

    );
});