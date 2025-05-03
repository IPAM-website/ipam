import { component$, getLocale, useSignal, useTask$, useStore, $, useStyles$, useVisibleTask$, Slot, noSerialize, QRL } from "@builder.io/qwik";
import TableMaps from "~/tableMaps";
import { server$ } from "@builder.io/qwik-city";
import tableStyle from "./tableStyle.css?inline"
import sql from "~/../db";
import ConfirmDialog from "~/components/ui/confirmDialog";
import PopupModal from "../ui/PopupModal";

interface LoaderState { [key: string]: boolean; }
interface DatiProps { dati: any, title?: string, nomeTabella: string, OnModify?: (row: any) => void; OnDelete?: (row: any) => void; DBTabella: string; funcReloadData?: () => any, onReloadRef?: (reloadFunc : ()=>void)=>void, noModify?:string, onRowClick?:(row:any)=>void, modifyWhen? : QRL<(r:any)=>boolean>, deleteWhen? : QRL<(r:any)=>boolean> }


export default component$<DatiProps>(({ dati: initialData, title = "", nomeTabella, OnModify, OnDelete = null, DBTabella, funcReloadData, onReloadRef, noModify = "", onRowClick=undefined, modifyWhen, deleteWhen }) => {
    const modificaIT_EN = ["Modifica", "Edit"];
    useStyles$(tableStyle);
    const showDialog = useSignal(false);
    const rowToDelete = useSignal<any>(null);
    const nT = useSignal(DBTabella);
    const lang = getLocale("en");
    const loadingStates = useStore<LoaderState>({});
    const rowIDC = useSignal<string | number | null>(null);
    const errorTimeout = useSignal<ReturnType<typeof setTimeout>>();
    const initialLoad = useSignal(true);

    const store = useStore({
        dati: Array.isArray(initialData) ? [...initialData] : [],
        error: null as string | null,
        globalLoading: false
    });

    const orderFilter = useStore(
        TableMaps[nT.value].keys.reduce((acc, key) => {
            if (key == "")
                return acc;
            acc[key] = 0;
            return acc;
        }, {} as Record<string, number>)
    );

    const showError = $((message: string) => {
        store.error = message;
        if (errorTimeout.value) clearTimeout(errorTimeout.value);
        errorTimeout.value = setTimeout(() => store.error = null, 5000);
    });

    const reloadData = $(async () => {
        store.globalLoading = true;
        try {
            const freshData = funcReloadData ? await funcReloadData() : await server$(async () => {
                //console.log("Fetching data from server for table:", nT.value);
                const result = await sql`SELECT * FROM ${sql(nT.value)}`;
                return Array.isArray(result) ? result : [];
            })();

            const sortData = (freshData as any[]).sort((a: any, b: any) => {
                for (const key in orderFilter) {
                    if (orderFilter[key] !== 0) {
                        const aValue = a[key] === undefined || a[key] === '' ? null : a[key];
                        const bValue = b[key] === undefined || b[key] === '' ? null : b[key];
                        if (aValue === null && bValue !== null) return 1;
                        if (bValue === null && aValue !== null) return -1;
                        if (aValue > bValue) return orderFilter[key];
                        if (aValue < bValue) return -orderFilter[key];
                    }
                }
                return 0;
            });
            store.dati = sortData;
        } catch (error) {
            console.log(error);
            showError(lang === 'it'
                ? "Errore durante il caricamento"
                : "Error during loading");
        } finally {
            store.globalLoading = false;
        }
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
        if(OnDelete)
            OnDelete(row);
    });

    const cancelDelete = $(() => {
        showDialog.value = false;
        rowToDelete.value = null;
    });


    useVisibleTask$(async () => {
        //await new Promise(resolve => setTimeout(resolve, 1500)); --> timer qwik
        initialLoad.value = false;
        if (onReloadRef)
            onReloadRef(reloadData);
    });

    useVisibleTask$(({ cleanup }) => {
        cleanup(() => {
            if (errorTimeout.value) clearTimeout(errorTimeout.value);
        });
    });

    if (!Array.isArray(initialData)) {
        return <div class="text-gray-500 text-center p-8 border-t border-neutral-200">Non sono presenti tecnici nella tabella</div>;
    }

    const settings = useStore({
        visible: false,
        tableColumnsKey: TableMaps[nT.value].keys.slice(0, 2),
        tableColumnsHeader: TableMaps[nT.value].headers[lang].slice(0, 2).concat(''),
        previewTableColumnsKey: TableMaps[nT.value].keys.slice(0, 2),
        previewTableColumnsHeader: TableMaps[nT.value].headers[lang].slice(0, 2)
    });

    const handleSettingsClosing = $(() => {
        settings.previewTableColumnsHeader = [];
        settings.tableColumnsHeader.map(x => settings.previewTableColumnsHeader.push(x));
        settings.previewTableColumnsKey = [];
        settings.tableColumnsKey.map(x => settings.previewTableColumnsKey.push(x));
        settings.visible = false;
    })

    const mff = $((r:any)=>{
        if(!modifyWhen)
            return true;
        else
            return modifyWhen(r);
    })

    const dff = $((r:any)=>{
        if(!deleteWhen)
            return true;
        else
            return deleteWhen(r);
    })

    return (
        <>



            {/* Pulsante Ricarica */}
            <div class="flex items-center px-1 pe-3">

                <div class="flex-auto m-5 mb-3 text-black text-base font-semibold font-['Inter']">
                    {title}
                </div>
                <div class="has-tooltip h-full flex items-center">
                    <button class="bg-white hover:bg-gray-100 border-[1.5px] cursor-pointer border-black px-0.5 py-0.5 mx-2 rounded-md" onClick$={() => { settings.visible = true }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                    </button>
                    <span class="tooltip">
                        {$localize`Table settings`}
                    </span>
                </div>

                <button
                    id="btnReload"
                    onClick$={reloadData}
                    disabled={store.globalLoading}
                    class={`flex items-center px-3.5 py-1.5 rounded-md 
                ${store.globalLoading
                            ? 'bg-gray-400 cursor-wait'
                            : 'bg-black hover:bg-gray-900 text-white cursor-pointer'}
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
            <div class="flex items-center mx-13">
                <Slot></Slot>
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
                            {settings.tableColumnsHeader.map((header) => {
                                const index = TableMaps[nT.value].headers[lang].indexOf(header);
                                const key = TableMaps[nT.value].keys[index];
                                //console.log(key);
                                return (
                                    <div key={index} class="text-zinc-500 text-sm cursor-pointer font-semibold py-3 px-4 flex items-center flex-1" onClick$={() => { if (header == "") return; orderFilter[key] = ((orderFilter[key] + 2) % 3) - 1; reloadData() }}>
                                        {header}
                                        {header != "" && <>{
                                            orderFilter[key] == 0 ?
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ms-5 flex-none transition-all size-3.5 text-gray-600">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                                                </svg>
                                                :
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width:40px" class={"ms-2 flex-none transition-all size-3.5 text-gray-600 " + (orderFilter[key] == -1 ? "rotate-z-180" : "")}>
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                                </svg>
                                        }</>}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Righe della tabella */}
                        {
                            Array.isArray(store.dati) && store.dati.length > 0 ? (
                                store.dati.map(async(row, rowIndex) => (
                                    <div key={rowIndex} class={"flex border-t border-neutral-200 hover:bg-gray-50 transition-colors " + (onRowClick !=undefined ? "cursor-pointer" : "")} onClick$={()=>{
                                        if(onRowClick)
                                            onRowClick(row);
                                    }}>
                                        {settings.tableColumnsKey.map((key, colIndex) => (
                                            <div key={colIndex} class="text-black text-base font-medium font-['Inter'] leading-normal p-4 flex-1">
                                                {row[key] instanceof Date ? row[key].toLocaleString().split(',')[0] : row[key] || "N/A"}
                                            </div>
                                        ))}
                                        <div class="text-black text-base font-medium font-['Inter'] leading-normal flex justify-end p-4 flex-1">
                                            {noModify == "" && (await mff(row)) &&  <button class="bg-amber-500 w-8 h-8 rounded-md inline-flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors has-tooltip"
                                                onClick$={(e) => {e.stopPropagation();OnModify?.(row)}}>
                                                <span class="tooltip">{lang === 'it' ? modificaIT_EN[0] : modificaIT_EN[1]}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-5 h-5">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                </svg>
                                            </button>}



                                            {/* Pulsante Elimina */}
                                            { (await dff(row)) &&<button class={`relative w-8 h-8 rounded-md ml-2 inline-flex items-center justify-center has-tooltip
                                            ${loadingStates[row[TableMaps[nT.value].keys[0]]] ? 'bg-red-400 cursor-wait' : 'bg-red-500 hover:bg-red-600 cursor-pointer'} transition-colors`}
                                                onClick$={(e) => {e.stopPropagation();handleDelete(row)}}
                                                disabled={loadingStates[row[TableMaps[nT.value].keys[0]]]}>
                                                <span class="tooltip">{$localize`Elimina`}</span>
                                                {loadingStates[row[TableMaps[nT.value].keys[0]]] ? (
                                                    <div class="loader-spinner"></div>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="white" class="w-5 h-5">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                )}
                                            </button>}
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

            <PopupModal title={$localize`Table Settings`} visible={settings.visible} onClosing$={handleSettingsClosing}>
                <div class="my-2 mb-5 ms-2 text-gray-700">
                    {$localize`Click on the column name to move it to the other list. After clicking save, this will change the view of the table.`}
                </div>
                <div class="settings flex pb-5 mx-20">
                    <div class="w-2/5">
                        <h1>{$localize`Hidden Columns`}</h1>
                        <div class="p-2 h-full border border-gray-300">
                            <ul class="list-none">
                                {(TableMaps[nT.value].headers[lang].filter(x => !settings.previewTableColumnsHeader.includes(x) && x != "")).map(x => {
                                    let index = TableMaps[nT.value].headers[lang].findIndex(i => i == x);
                                    return <li value={TableMaps[nT.value].keys[index]} class="rounded-lg hover:bg-gray-100 p-0.5 ps-2 cursor-pointer transition-all" onClick$={() => {
                                        settings.previewTableColumnsHeader.push(TableMaps[nT.value].headers[lang][index]);
                                        settings.previewTableColumnsKey.push(TableMaps[nT.value].keys[index]);
                                    }}>{x}</li>;
                                })}
                            </ul>
                        </div>
                    </div>
                    <div class="flex-auto flex relative top-4 flex-col items-center justify-center">
                        <button class="has-tooltip" onClick$={() => {
                            const other_columns_head = TableMaps[nT.value].headers[lang].filter(x => !settings.previewTableColumnsHeader.includes(x) && x != "");
                            const other_columns_key = TableMaps[nT.value].keys.filter(x => !settings.previewTableColumnsKey.includes(x) && x != "");
                            settings.previewTableColumnsHeader = other_columns_head;
                            settings.previewTableColumnsKey = other_columns_key;
                        }}>
                            <div class="rounded-[50%] hover:bg-gray-200 p-1.5 cursor-pointer  transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                </svg>
                            </div>
                            <span class="tooltip">
                                {$localize`Switch All`}
                            </span>
                        </button>
                    </div>
                    <div class="w-2/5">
                        <h1>{$localize`Viewed Columns`}</h1>
                        <div class=" p-2 h-full border border-gray-300">
                            <ul class="list-none">
                                {settings.previewTableColumnsHeader.map(x => {
                                    let index = settings.previewTableColumnsHeader.findIndex(i => i == x);
                                    return (<div class="flex items-center">
                                        <li value={settings.tableColumnsKey[index]} class="rounded-lg flex-1 hover:bg-gray-100 p-0.5 ps-2 cursor-pointer transition-all" onClick$={() => {
                                            settings.previewTableColumnsHeader.splice(index, 1);
                                            settings.previewTableColumnsKey.splice(index, 1);
                                        }}>{x}

                                        </li>
                                        <button onClick$={() => {
                                            const swHE = [settings.previewTableColumnsHeader[index], settings.previewTableColumnsHeader[index - 1]];
                                            settings.previewTableColumnsHeader.splice(index - 1, 2, ...swHE);
                                            const swKE = [settings.previewTableColumnsKey[index], settings.previewTableColumnsKey[index - 1]];
                                            settings.previewTableColumnsKey.splice(index - 1, 2, ...swKE);
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-gray-400 hover:text-black" style={{ visibility: index != 0 ? "visible" : "hidden" }}>
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                                            </svg>
                                        </button>
                                        <button onClick$={() => {
                                            const swHE = [settings.previewTableColumnsHeader[index + 1], settings.previewTableColumnsHeader[index]];
                                            settings.previewTableColumnsHeader.splice(index, 2, ...swHE);
                                            const swKE = [settings.previewTableColumnsKey[index + 1], settings.previewTableColumnsKey[index]];
                                            settings.previewTableColumnsKey.splice(index, 2, ...swKE);
                                        }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-gray-400 mx-0.5 hover:text-black" style={{ visibility: index < settings.previewTableColumnsHeader.length - 1 ? "visible" : "hidden" }}>
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                                            </svg>
                                        </button>
                                    </div>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="w-full mt-3 gap-1 flex justify-end">
                    <button class="bg-red-500 text-gray-50 rounded-sm p-0.5 px-2 cursor-pointer transition-all hover:bg-red-400" onClick$={() => {
                        settings.previewTableColumnsHeader = [];
                        settings.tableColumnsHeader.map(x => {if(x=='') return; settings.previewTableColumnsHeader.push(x)});
                        settings.previewTableColumnsKey = [];
                        settings.tableColumnsKey.map(x => settings.previewTableColumnsKey.push(x));
                        settings.visible = false;
                    }}>{$localize`Cancel`}</button>
                    <button class="bg-green-500 flex items-center gap-1 text-gray-50 rounded-sm p-0.5 px-2 cursor-pointer transition-all hover:bg-green-400" onClick$={() => {
                        settings.tableColumnsHeader = [];
                        settings.previewTableColumnsHeader.map(x => settings.tableColumnsHeader.push(x));
                        settings.tableColumnsHeader.push("");
                        settings.tableColumnsKey = [];
                        settings.previewTableColumnsKey.map(x => settings.tableColumnsKey.push(x));
                        settings.visible = false;
                        reloadData();
                    }}>
                        {$localize`Save`}
                        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                        </svg> */}

                    </button>
                </div>
            </PopupModal>
        </>

    );
});