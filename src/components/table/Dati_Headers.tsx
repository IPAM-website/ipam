import { component$, getLocale, useSignal, useTask$, useStore, $, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import TableMaps from "./tableMaps";
import { server$ } from "@builder.io/qwik-city";
import sql from "~/../db";
import tableStyle from "./tableStyle.css?inline";
import ConfirmDialog from "~/components/ui/confirmDialog";

interface LoaderState { [key: string]: boolean; }
interface DatiProps { dati: any[], nomeTabella: string, onUpdate$?:(e:any)=>void, onDelete$?:(e:any)=>void }

export const CRUDRow = server$(async (action, row, nT) => {
    try {
        switch (action) {
            case "d":
                const tabellaKey = TableMaps[nT].keys[0];
                const keyID = row[tabellaKey];
                await sql`DELETE FROM ${sql(nT)} WHERE ${sql(tabellaKey)} = ${keyID}`;
                return { success: true };
            default:
                return { errore: "Azione non riconosciuta" };
        }
    } catch {
        return { errore: "SI" };
    }
});

export default component$<DatiProps>(({ dati: initialData, nomeTabella, onUpdate$=$(()=>{}), onDelete$=$(()=>{}) }) => {
    const showDialog = useSignal(false);
    const rowToDelete = useSignal<any>(null);
    useStyles$(tableStyle);
    const nT = useSignal(nomeTabella);
    const lang = getLocale("en");
    const store = useStore({
        dati: [...initialData],
        error: null as string | null,
        globalLoading: false
    });
    
    const loadingStates = useStore<LoaderState>({});
    const rowIDC = useSignal<string | number | null>(null);
    const errorTimeout = useSignal<ReturnType<typeof setTimeout>>();
    const initialLoad = useSignal(true);

    useVisibleTask$(async ({track}) => {
        //await new Promise(resolve => setTimeout(resolve, 1500)); --> timer qwik
        initialLoad.value = false;
    });

    useTask$(() => {
        const tableNameMap: { [key: string]: string } = {
            clients: "clienti",
            technicians: "tecnici"
        };
        if (tableNameMap[nT.value]) {
            nT.value = tableNameMap[nT.value];
        }
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
        
        //await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Aggiornamento ottimistico
        store.dati = store.dati.filter(item => 
            item[TableMaps[nT.value].keys[0]] !== rowId
        );

        const result = await CRUDRow("d", row, nT.value);
        
        if (result?.errore) {
            store.dati = [...store.dati, row];
            showError(lang === 'it' 
                ? "Errore durante l'eliminazione" 
                : "Error during deletion");
        }
        
        loadingStates[rowId] = false;
    });

    const cancelDelete = $(() => {
        showDialog.value = false;
        rowToDelete.value = null;
    });


    return (
        <div class="w-11/12 mx-auto">
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
                    {store.dati.length > 0 ? (
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
                                        onClick$={() => onUpdate$(row)}>
                                        <span class="tooltip">{$localize`Modifica`}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </button>
                                    
                                    {/* Pulsante Elimina */}
                                    <button class={`relative w-8 h-8 rounded-md ml-2 inline-flex items-center justify-center has-tooltip
                                        ${loadingStates[row[TableMaps[nT.value].keys[0]]] ? 'bg-red-400 cursor-wait' : 'bg-red-500 hover:bg-red-600 cursor-pointer'} transition-colors`}
                                        onClick$={async () => await handleDelete(row)}
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
                    )}
                </>
            )}
        </div>
    );
});