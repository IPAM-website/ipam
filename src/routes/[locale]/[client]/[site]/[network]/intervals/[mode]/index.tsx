import { $, component$, getLocale, Signal, Slot, UseSignal, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { Form, RequestHandler, routeAction$, routeLoader$, server$, useContent, useLocation, useNavigate, z, zod$ } from "@builder.io/qwik-city";
import sql from "~/../db"
import AddressBox, { getNetwork } from "~/components/forms/formsComponents/AddressBox";
import DatePicker from "~/components/forms/formsComponents/DatePicker";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
import Title from "~/components/layout/Title";
import { ReteModel, VLANModel, IndirizziModel, IntervalloModel } from "~/dbModels";
import ButtonAddLink from "~/components/table/ButtonAddLink";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ImportCSV from "~/components/table/ImportCSV";
import PopupModal from "~/components/ui/PopupModal";
import { getBaseURL } from "~/fnUtils";
import SiteNavigator from "~/components/layout/SiteNavigator";
// import { useNotify } from "~/services/notifications";

export const onRequest: RequestHandler = ({ params, redirect, url }) => {
    if (!['view', 'insert', 'update'].includes(params.mode)) {
        let splitURL = url.href.split('/');
        splitURL.pop();
        splitURL.pop();
        throw redirect(301, splitURL.join('/') + "/view")
    }
}

export interface FilterObject {
    active: boolean;
    visible: boolean;
    params: {
        [key: string]: string;
    }
}


export const getIntervals = server$(async function (this, filter = { empty: 1 }) {
    filter.query = filter.query ? filter.query + '%' : filter.query = "%";
    filter.query = (filter.query as string).trim();
    let intervals: IntervalloModel[] = [];

    if (filter.empty == 1) {
        const queryResult = await sql`SELECT * FROM intervalli INNER JOIN siti_rete ON intervalli.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site}`;
        intervals = queryResult as unknown as IntervalloModel[];
        return intervals;
    }

    // if (this.query.has("network") || (filter.network != undefined && filter.network != '')) {


    //     if (isNaN(parseInt(filter.query))) {
    //         const queryResult = await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.query.get("network") ?? filter.network} WHERE indirizzi.nome_dispositivo LIKE ${filter.query}`;
    //         addresses = queryResult as unknown as IndirizziModel[];
    //     }
    //     else {
    //         const queryResult = await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.query.get("network") ?? filter.network} WHERE indirizzi.ip LIKE ${filter.query}`;
    //         addresses = queryResult as unknown as IndirizziModel[];
    //     }

    // }
    // else {


    //     if (isNaN(parseInt(filter.query))) {
    //         const queryResult = await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site} AND indirizzi.nome_dispositivo LIKE ${filter.query}`;
    //         addresses = queryResult as unknown as IndirizziModel[];
    //     }
    //     else {
    //         const queryResult = await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site} AND indirizzi.ip LIKE ${filter.query}`;
    //         addresses = queryResult as unknown as IndirizziModel[];
    //     }
    // }

    return intervals;
})


export const useSiteName = routeLoader$(async ({ params }) => {
    return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0].nomesito;
})


export const useAction = routeAction$(async (data, ev) => {
    let success = false;
    let type_message = 0;
    try {
        if (ev.params.mode == "update") {
            await sql`UPDATE intervalli SET nomeintervallo= ${data.nomeintervallo},iniziointervallo = ${data.iniziointervallo}, lunghezzaintervallo = ${data.lunghezzaintervallo}, fineintervallo=${data.fineintervallo},idrete=${data.idrete} WHERE idintervallo=${data.idintervallo}`;
            type_message = 2;
        } else {
            await sql`INSERT INTO intervalli(nomeintervallo,iniziointervallo,lunghezzaintervallo,fineintervallo,idrete) VALUES (${data.nomeintervallo},${data.iniziointervallo},${data.lunghezzaintervallo},${data.fineintervallo},${data.idrete})`;
            type_message = 1;
        }
        success = true;
    } catch (e) {
        if (ev.params.mode == "update")
            type_message = 4;
        else
            type_message = 3;
    }

    return {
        success,
        type_message
    }
},
    zod$({
        idintervallo: z.number(),
        nomeintervallo: z.string(),
        iniziointervallo: z.string(),
        lunghezzaintervallo: z.number(),
        fineintervallo: z.string(),
        idrete: z.number()
    }))


export const getAllIntervals = server$(async function () {
    let intervals: IntervalloModel[] = [];
    try {
        const query = await sql`SELECT * FROM intervalli`
        intervals = query as unknown as IntervalloModel[];
    }
    catch (e) {
        console.log(e);
    }

    return intervals;
})

export const getAllNetworksBySite = server$(async function (idsito: number) {
    let networks: ReteModel[] = [];
    try {
        const query = await sql`SELECT rete.* FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete 
                                WHERE siti_rete.idsito=${idsito}`
        networks = query as unknown as ReteModel[];
    }
    catch (e) {
        console.log(e);
    }

    return networks;
})

export const deleteInterval = server$(async function (this, data) {
    try {
        await sql`DELETE FROM intervalli WHERE idintervallo=${data.idintervallo}`;
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
})

export const isOccupied = server$(async function (this, data) {
    try {
        if (this.params.mode == "insert") {
            const result = await sql`
            SELECT COUNT(*) as count 
            FROM indirizzi 
            WHERE ip >= ${data.iniziointervallo} AND ip <= ${data.fineintervallo} AND idrete = ${data.idrete}
            UNION 
            SELECT COUNT(*) as count 
            FROM intervalli 
            WHERE idrete = ${data.idrete} 
            
            AND (
            (iniziointervallo >= ${data.iniziointervallo} AND iniziointervallo <= ${data.fineintervallo}) 
            OR (fineintervallo >= ${data.iniziointervallo} AND fineintervallo <= ${data.fineintervallo}) 
            OR (iniziointervallo <= ${data.iniziointervallo} AND fineintervallo >= ${data.fineintervallo})
            )
        `;
            const count = result.reduce((acc: number, i: any) => {
                if (acc === undefined) acc = 0;
                return acc + parseInt(i.count, 10);
            }, 0)
            return count > 0;
        }
        else if (this.params.mode == "update") {
            const result = await sql`
            SELECT COUNT(*) as count 
            FROM indirizzi 
            WHERE ip >= ${data.iniziointervallo} AND ip <= ${data.fineintervallo} AND idrete = ${data.idrete}
            UNION 
            SELECT COUNT(*) as count 
            FROM intervalli 
            WHERE idrete = ${data.idrete} 
            AND idintervallo != ${data.idintervallo} -- Exclude the current interval in update mode
            AND (
            (iniziointervallo >= ${data.iniziointervallo} AND iniziointervallo <= ${data.fineintervallo}) 
            OR (fineintervallo >= ${data.iniziointervallo} AND fineintervallo <= ${data.fineintervallo}) 
            OR (iniziointervallo <= ${data.iniziointervallo} AND fineintervallo >= ${data.fineintervallo})
            )
        `;
            const count = result.reduce((acc: number, i: any) => {
                if (acc === undefined) acc = 0;
                return acc + parseInt(i.count, 10);
            }, 0)
            return count > 0;
        }

        return false;
    }
    catch (e) {
        console.log(e);
        return false;
    }
})

type Notification = {
    message: string;
    type: 'success' | 'error';
};

export default component$(() => {
    // const notify = useNotify();
    const lang = getLocale("en");
    const intervalList = useSignal<IntervalloModel[]>([]);
    const networks = useSignal<ReteModel[]>([]);
    const loc = useLocation();
    const nav = useNavigate();
    const interval = useStore<IntervalloModel>({
        fineintervallo: '',
        idintervallo: 0,
        idrete: 0,
        iniziointervallo: '',
        lunghezzaintervallo: 0,
        nomeintervallo: '',
        descrizioneintervallo: ''
    });
    const sitename = useSiteName();
    const filter = useStore<FilterObject>({ active: false, visible: false, params: { network: '', query: '' } });
    const mode = loc.params.mode ?? "view";
    const txtQuickSearch = useSignal<HTMLInputElement>();
    const reloadFN = useSignal<(() => void) | null>(null);
    const notifications = useSignal<Notification[]>([]);

    useTask$(async ({ track }) => {
        intervalList.value = await getAllIntervals();
        networks.value = await getAllNetworksBySite(parseInt(loc.params.site));

        for (const [key, value] of loc.url.searchParams.entries()) {
            filter.params[key] = value;
            filter.active = true;
        }

    })

    const addNotification = $((message: string, type: 'success' | 'error') => {
        notifications.value = [...notifications.value, { message, type }];
        // Rimuovi la notifica dopo 3 secondi
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.message !== message);
        }, 3000);
    });

    const handleError = $((error: any) => {
        console.log(error);
        addNotification(lang === "en" ? "Error during import" : "Errore durante l'importazione", 'error');
    })

    const handleOkay = $(() => {
        // console.log("ok");
        addNotification(lang === "en" ? "Import completed successfully" : "Importazione completata con successo", 'success');
    })

    const handleModify = $((row: any) => {
        Object.assign(interval, row as IntervalloModel);
        nav(loc.url.href.replace("view", "update"));
    })

    const handleDelete = $(async (row: any) => {
        if (await deleteInterval({ idintervallo: row.idintervallo }))
            addNotification(lang === "en" ? "Deleted successfully" : "Eliminato con successo", 'success');
        else
            addNotification(lang === "en" ? "Error during deletion" : "Errore durante l'eliminazione", 'error');

    });

    const reloadData = $(async () => {
        // if (filter.active)
        //     return await get(filter.params);
        // else
        return await getAllIntervals();
    })

    const getREF = $((reloadFunc: () => void) => { reloadFN.value = reloadFunc; })

    return (
        <>
            {/* <Title haveReturn={true} url={mode == "view" ? loc.url.pathname.split("intervals")[0] : loc.url.pathname.replace(mode, "view")} > {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} Intervals</Title> */}
            {
                mode == "view"
                    ? (
                        <div>
                            {/* <PopupModal title="Filters" visible={filter.visible} onClosing$={() => filter.visible = false}>
                                <div class="flex">
                                    <div class="w-full">
                                        <span class="ms-2">Network</span>
                                        <SelectForm OnClick$={(e) => { filter.params.network = (e.target as HTMLOptionElement).value }} id="filter-network" name="" value={filter.params.network} listName="Reti">
                                            {networks.value.map((x: ReteModel) => <option value={x.idrete}>{x.nomerete}</option>)}
                                        </SelectForm>
                                    </div>
                                </div>
                                <div class="flex w-full mt-2">
                                    <div class="flex-auto"></div>
                                    <button class=" flex gap-1 items-center p-2 px-4 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 border cursor-pointer disabled:cursor-default text-gray-900 rounded-lg mx-2" disabled={filter.params.subsite == ''} onClick$={() => {
                                        window.location.href = loc.url.pathname;
                                    }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                        Reset</button>

                                    <button class="p-2 flex items-center gap-1 px-4 bg-black hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer disabled:cursor-default text-white rounded-md" disabled={filter.params.subsite == ''} onClick$={async () => {
                                        let url = loc.url.pathname + "?";
                                        let searchParams = new URLSearchParams();
                                        for (let key in filter.params)
                                            if (filter.params[key] != '') {
                                                searchParams.append(key, filter.params[key])
                                                filter.active = true;
                                            }

                                        nav(url + searchParams);

                                        if (reloadFN) {
                                            reloadFN.value?.();
                                            filter.visible = false;
                                        }
                                    }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                        Search</button>

                                </div>
                            </PopupModal> */}

                            {/* <SiteNavigator /> */}

                            <Table>
                                <Dati DBTabella="intervalli" title={$localize`Lista intervalli`} dati={intervalList.value} nomeTabella={"intervalli"} OnModify={handleModify} OnDelete={handleDelete} funcReloadData={reloadData} onReloadRef={getREF}>
                                    {/* <TextboxForm id="txtfilter" value={filter.params.query} ref={txtQuickSearch} placeholder={$localize`Ricerca rapida`} OnInput$={(e) => {
                                        filter.params.query = (e.target as HTMLInputElement).value;
                                        filter.active = false;
                                        for (let item in filter.params) {
                                            if (filter.params[item] && filter.params[item] != '') {
                                                filter.active = true;
                                                break;
                                            }
                                        }
                                        if (reloadFN)
                                            reloadFN.value?.();
                                    }} /> */}
                                    {/* <div class="has-tooltip">
                                        <button class="cursor-pointer p-1 rounded-md bg-black hover:bg-gray-700 text-white size-[32px] flex items-center justify-center" onClick$={() => filter.visible = true} >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                                            </svg>
                                        </button>
                                        <span class="tooltip">
                                            {$localize`Filters`}
                                        </span>
                                    </div>
                                    {filter.active && <div class="has-tooltip"><button class="size-[24px] bg-red-500 cursor-pointer hover:bg-red-400 text-white flex justify-center items-center rounded ms-2" onClick$={() => { filter.active = false; for (const key in filter.params) filter.params[key] = ''; nav(loc.url.pathname); if (txtQuickSearch.value) txtQuickSearch.value.value = ""; reloadFN.value?.() }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                        <span class="tooltip mb-1 ml-1.5">{$localize`Erase Filters`}</span>
                                    </button></div>} */}
                                </Dati>
                                <ButtonAddLink nomePulsante={$localize`Aggiungi intervallo`} href={loc.url.href.replace("view", "insert")}></ButtonAddLink>
                                <ImportCSV OnError={handleError} OnOk={handleOkay} nomeImport="intervallo" />
                            </Table>



                        </div>)
                    :
                    <CRUDForm data={interval} reloadFN={reloadFN} />
            }
        </>);
})


export const FormBox = component$(({ title }: { title?: string }) => {
    return (<>
        <div class="rounded-lg border border-gray-300">
            {
                title &&
                <div class="w-full p-2 border-b-1 border-gray-200">
                    <h1>{title}</h1>
                </div>
            }
            <div class="w-full *:w-full **:flex-1 *:flex p-4">
                <Slot></Slot>
            </div>
        </div>
    </>)
})

export const CRUDForm = component$(({ data, reloadFN }: { data?: IntervalloModel, reloadFN?: Signal<(() => void) | null> }) => {
    const lang = getLocale("en")
    const loc = useLocation();
    const nav = useNavigate();
    const action = useAction();

    const network = useSignal<ReteModel>();

    const formData = useStore<IntervalloModel>({
        fineintervallo: '',
        idintervallo: 0,
        idrete: 0,
        iniziointervallo: '',
        lunghezzaintervallo: 0,
        nomeintervallo: '',
        descrizioneintervallo: ''
    });


    const attempted = useSignal<boolean>(false);
    const changeIP = useSignal<boolean>(false);

    const networks = useSignal<ReteModel[]>([]);
    const intervals = useSignal<IntervalloModel[]>([]);

    const ipErrors = useSignal<string[]>([]);
    const ipFineErrors = useSignal<string[]>([]);
    const alreadyOccupied = useSignal<boolean>(false);

    useTask$(async () => {

        Object.assign(formData, data as IntervalloModel);

        networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
        intervals.value = await getAllIntervals();

        network.value = networks.value.find(x => x.idrete == parseInt(loc.url.searchParams.get('network') || "0"))
        // console.log(network.value)
    })

    const updateFIP = useSignal<() => void>(() => { });

    const handleUpdate = $((e: () => void) => {
        updateFIP.value = e;
    })

    return (
        <>

            <div class="m-2 sm:grid sm:grid-cols-2 max-sm:*:my-2 gap-4 relative">
                <FormBox title="Informazioni">
                    <TextboxForm id="txtName" title={$localize`Nome Intervallo`} value={formData.nomeintervallo} placeholder="Es. Intervallo 1" OnInput$={(e) => formData.nomeintervallo = (e.target as HTMLInputElement).value} />
                    <TextboxForm id="txtModel" title={$localize`Descrizione Intervallo`} value={formData.descrizioneintervallo} placeholder="Es. Pool indirizzi ufficio 1" OnInput$={(e) => formData.descrizioneintervallo = (e.target as HTMLInputElement).value} />
                </FormBox>
                <FormBox title="Dettagli">
                    <AddressBox title={$localize`IP Iniziale`} disabled={loc.params.mode == "update"} addressType="host" currentIPNetwork={formData.idrete ?? -1} prefix={network.value?.prefissorete.toString()} value={formData?.iniziointervallo} OnInput$={(e) => {
                        // console.log(formData.idrete);
                        if (e.complete) {
                            formData.iniziointervallo = e.ip;

                            if (formData.fineintervallo != "") {
                                const parsedIP = formData.iniziointervallo.split('.').map(x => parseInt(x));
                                const parsedFineIP = formData.fineintervallo.split('.').map(x => parseInt(x));

                                let distance = 0;

                                for (let [i, v] of parsedIP.entries()) {
                                    distance += (parsedFineIP[i] - v) * (Math.pow(2, 8 * (3 - i)));
                                }

                                if (distance < 1) {
                                    ipFineErrors.value.push("Interval size is invalid")
                                    return;
                                }
                                formData.lunghezzaintervallo = distance;
                                console.log(distance);

                                isOccupied(formData).then(result => alreadyOccupied.value = result);
                            }

                        }

                        ipErrors.value = e.errors;
                    }} />
                    {attempted.value && !formData.iniziointervallo && <span class="text-red-600">{$localize`This IP Address is invalid`}</span>}

                    {ipErrors.value && <span class="text-red-600">{ipErrors.value.map((x: string) => <>{x}<br /></>)}</span>}

                    <AddressBox title={$localize`IP Finale`} disabled={loc.params.mode == "update"} addressType="host" value={formData.fineintervallo} currentIPNetwork={formData.idrete ?? -1} prefix={network.value?.prefissorete.toString()} forceUpdate$={handleUpdate} OnInput$={(e) => {
                        ipFineErrors.value = e.errors;

                        if (e.complete && formData.iniziointervallo != "") {
                            const parsedIP = formData.iniziointervallo.split('.').map(x => parseInt(x));
                            const parsedFineIP = e.ip.split('.').map(x => parseInt(x));

                            let distance = 0;

                            for (let [i, v] of parsedIP.entries()) {
                                distance += (parsedFineIP[i] - v) * (Math.pow(2, 8 * (3 - i)));
                            }

                            if (distance < 1) {
                                ipFineErrors.value.push("Interval size is invalid")
                                return;
                            }

                            formData.fineintervallo = e.ip;
                            formData.lunghezzaintervallo = distance;
                            isOccupied(formData).then(result => alreadyOccupied.value = result);
                        }
                    }} />

                    {ipFineErrors.value && <span class="text-red-600">{ipFineErrors.value.map((x: string) => <>{x}<br /></>)}</span>}

                    <TextboxForm id="txtLunghezza" value={formData.lunghezzaintervallo.toString()} title={$localize`Lunghezza`} placeholder="Interval Length" OnInput$={(e) => {
                        const lunghezza = parseInt((e.target as HTMLInputElement).value);
                        if (isNaN(lunghezza))
                            return;

                        formData.lunghezzaintervallo = parseInt((e.target as any).value);
                        // modificare indirizzo finale
                        let parsedIP = formData.iniziointervallo.split('.').map(x => parseInt(x));
                        parsedIP[3] += lunghezza;
                        for (let i = 3; i > 1; i--) {
                            if (isNaN(parsedIP[i]))
                                return;

                            if (parsedIP[i] >= 256) {
                                parsedIP[i - 1] = parsedIP[i - 1] + Math.trunc(parsedIP[i] / 256);
                                parsedIP[i] = parsedIP[i] % 256;
                            }
                            else
                                break;
                        }
                        formData.fineintervallo = parsedIP.join('.');
                        updateFIP.value();
                        isOccupied(formData).then(result => alreadyOccupied.value = result);
                    }} />
                    {attempted.value && !formData.lunghezzaintervallo && <span class="text-red-600">{$localize`This length is invalid`}</span>}

                    <SelectForm id="cmbRete" title="Rete" name={$localize`Rete Associata`} value={formData.idrete?.toString() || ""} OnClick$={async (e) => { formData.idrete = parseInt((e.target as HTMLOptionElement).value); network.value = networks.value.find(x => x.idrete == formData.idrete) }} listName="">
                        {networks.value.map((x: ReteModel) => <option key={x.idrete} value={x.idrete}>{x.nomerete}</option>)}
                    </SelectForm>
                    {attempted.value && !formData.idrete && <span class="text-red-600">{$localize`Please select a network`}</span>}

                    {alreadyOccupied.value && <span class="text-red-600">{$localize`Space already occupied`}</span>}

                </FormBox>

            </div>
            <button onClick$={async (e) => {
                e.preventDefault();
                if (!formData.lunghezzaintervallo || formData.iniziointervallo == "" || !formData.idrete) {
                    attempted.value = true;
                    if (isNaN(formData.lunghezzaintervallo))
                        formData.lunghezzaintervallo = 0;
                    return;
                }
                await action.submit(formData);
                if (action.value && action.value.success) {
                    await new Promise((resolve) => { setTimeout(resolve, 2000) });
                    window.location.href = loc.url.href.replace("insert", "view").replace("update", "view");
                }

            }} class="bg-green-500 transition-all hover:bg-green-600 disabled:bg-green-300 rounded-md text-white p-2 mx-1 ms-4" disabled={
                !formData.lunghezzaintervallo || formData.iniziointervallo == "" || !formData.idrete
            }>{$localize`Conferma`}</button>
            <a class="bg-red-500 hover:bg-red-600 transition-all rounded-md text-white p-2 inline-block mx-1" href={loc.url.href.replace("insert", "view").replace("update", "view")}>{$localize`Annulla`}</a>
            {action.submitted && action.value &&
                <div class={action.value.success ? "bg-green-400 p-2 rounded-md text-white mt-2" : "bg-red-400 p-2 mt-2 rounded-md text-white"}>
                    {action.value.type_message == 1 && <span>{$localize`Inserimento avvenuto correttamente`}</span>}
                    {action.value.type_message == 2 && <span>{$localize`Modifica avvenuta correttamente`}</span>}
                    {action.value.type_message == 3 && <span>{$localize`Errore durante l'inserimento`}</span>}
                    {action.value.type_message == 4 && <span>{$localize`Errore durante la modifica`}</span>}
                </div>
            }
        </>
    )
})