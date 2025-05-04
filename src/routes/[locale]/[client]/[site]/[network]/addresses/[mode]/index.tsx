import { $, component$, getLocale, Signal, Slot, UseSignal, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { Form, RequestHandler, routeAction$, routeLoader$, server$, useContent, useLocation, useNavigate, z, zod$ } from "@builder.io/qwik-city";
import sql from "~/../db"
import AddressBox, { getNetwork } from "~/components/forms/formsComponents/AddressBox";
import DatePicker from "~/components/forms/formsComponents/DatePicker";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
import Title from "~/components/layout/Title";
import { ReteModel, VLANModel, IndirizziModel } from "~/dbModels";
import ButtonAddLink from "~/components/table/ButtonAddLink";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ImportCSV from "~/components/table/ImportCSV";
import PopupModal from "~/components/ui/PopupModal";
import { getBaseURL } from "~/fnUtils";
import SiteNavigator from "~/components/layout/SiteNavigator";
import BtnInfoTable from "~/components/table/btnInfoTable";
import TableInfoCSV from "~/components/table/tableInfoCSV";
// import { useNotify } from "~/services/notifications";

export const onRequest: RequestHandler = ({ params, redirect, url }) => {
    if (!['view', 'insert', 'update'].includes(params.mode)) {
        let splitURL = url.href.split('/');
        splitURL.pop();
        splitURL.pop();
        throw redirect(301, splitURL.join('/') + "/view")
    }
}

export interface RowAddress {
    descrizione?: string,
    idrete?: number,
    idsito?: number,
    idsottosito?: number,
    vid?: number,
    ip?: string,
    n_prefisso?: number,
    nomerete?: string,
    nomesottosito?: string,
    nome_dispositivo?: string,
    brand_dispositivo?: string,
    data_inserimento?: string,
    tipo_dispositivo?: string
}



export interface FilterObject {
    active: boolean;
    visible: boolean;
    params: {
        [key: string]: string;
    }
}


export const useAddresses = server$(async function (this, filter = { empty: 1 }) {
    filter.query = filter.query ? filter.query + '%' : filter.query = "%";
    filter.query = (filter.query as string).trim();
    let addresses: IndirizziModel[] = [];

    if (filter.empty == 1) {
        const queryResult = await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete INNER JOIN siti_rete ON rete.idrete = siti_rete.idrete WHERE siti_rete.idsito=${this.params.site}`;
        addresses = queryResult as unknown as IndirizziModel[];
        return addresses;
    }

    // if (this.query.has("network") || (filter.network != undefined && filter.network != '')) {


        if (isNaN(parseInt(filter.query))) {
            const queryResult = await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.params.network ?? filter.network} WHERE indirizzi.nome_dispositivo LIKE ${filter.query}`;
            addresses = queryResult as unknown as IndirizziModel[];
        }
        else {
            const queryResult = await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.params.network ?? filter.network} WHERE indirizzi.ip LIKE ${filter.query}`;
            addresses = queryResult as unknown as IndirizziModel[];
        }

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

    return addresses;
})


export const useSiteName = routeLoader$(async ({ params }) => {
    return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0].nomesito;
})


export const useAction = routeAction$(async (data) => {
    let success = false;
    let type_message = 0;
    // console.log(data.data_inserimento);
    try {
        if (data.mode == "update") {
            await sql`UPDATE indirizzi SET ip=${data.to_ip}, idrete=${data.idrete}, vid=${data.vid}, n_prefisso=${data.n_prefisso}, tipo_dispositivo=${data.tipo_dispositivo}, brand_dispositivo=${data.brand_dispositivo}, nome_dispositivo=${data.nome_dispositivo}, data_inserimento=${data.data_inserimento} WHERE ip=${data.ip}`;
            type_message = 2;
        } else {
            await sql`INSERT INTO indirizzi(ip,idrete,vid,n_prefisso,tipo_dispositivo,brand_dispositivo,nome_dispositivo,data_inserimento) VALUES (${data.ip},${data.idrete},${data.vid},${data.n_prefisso},${data.tipo_dispositivo},${data.brand_dispositivo},${data.nome_dispositivo},${data.data_inserimento})`;
            type_message = 1;
        }
        success = true;
    } catch (e) {
        if (data.mode == "update")
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
        ip: z.string().min(8),
        idrete: z.number().positive(),
        vid: z.number().positive(),
        n_prefisso: z.number().positive().max(31).min(0),
        to_ip: z.string(),
        mode: z.string(),
        tipo_dispositivo: z.string(),
        brand_dispositivo: z.string(),
        nome_dispositivo: z.string(),
        data_inserimento: z.any()
    }))


export const getAllVLAN = server$(async function () {
    let vlans: VLANModel[] = [];
    try {
        const query = await sql`SELECT * FROM vlan`
        vlans = query as unknown as VLANModel[];
    }
    catch (e) {
        console.log(e);
    }

    return vlans;
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

export const deleteIP = server$(async function (this, data) {
    try {
        await sql`DELETE FROM indirizzi WHERE ip=${data.address}`;
        return true;
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
    const addressList = useSignal<IndirizziModel[]>([]);
    const networks = useSignal<ReteModel[]>([]);
    const loc = useLocation();
    const nav = useNavigate();
    const address = useStore<RowAddress>({});
    const sitename = useSiteName();
    const filter = useStore<FilterObject>({ active: false, visible: false, params: { network: '', query: '' } });
    const mode = loc.params.mode ?? "view";
    const txtQuickSearch = useSignal<HTMLInputElement>();
    const reloadFN = useSignal<(() => void) | null>(null);
    const notifications = useSignal<Notification[]>([]);
    const showPreview = useSignal(false);

    useTask$(async ({ track }) => {
        addressList.value = await useAddresses();
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
        Object.assign(address, row as RowAddress);
        nav(loc.url.href.replace("view", "update"));
    })

    const handleDelete = $(async (row: any) => {
        if (await deleteIP({ address: row.ip }))
            addNotification(lang === "en" ? "Deleted successfully" : "Eliminato con successo", 'success');
        else
            addNotification(lang === "en" ? "Error during deletion" : "Errore durante l'eliminazione", 'error');

    });

    const reloadData = $(async () => {
        if (filter.active)
            return await useAddresses(filter.params);
        else
            return await useAddresses();
    })

    const getREF = $((reloadFunc: () => void) => { reloadFN.value = reloadFunc; })

    const showPreviewCSV = $(() => {
        showPreview.value = true;
    })

    return (
        <>
            {/* <Title haveReturn={true} url={mode == "view" ? loc.url.pathname.split('/info')[0].split('/').slice(0,4).join('/') : loc.url.pathname.replace(mode, "view")} > {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} IP</Title> */}
            {
                mode == "view"
                    ? (
                        <div>
                            <PopupModal title="Filters" visible={filter.visible} onClosing$={() => filter.visible = false}>
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
                            </PopupModal>

                            {/* <SiteNavigator /> */}

                            <Table>
                                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 bg-gray-50 px-4 py-3 rounded-t-xl border-b border-gray-200">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold text-lg text-gray-800">{$localize`Lista indirizzi`}</span>
                                        <BtnInfoTable showPreviewInfo={showPreviewCSV}></BtnInfoTable>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <TextboxForm id="txtfilter" search={true} value={filter.params.query} ref={txtQuickSearch} placeholder={$localize`Ricerca rapida`} OnInput$={(e) => {
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
                                        }} />
                                        <div class="has-tooltip">
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
                                        </button></div>}
                                    </div>
                                </div>
                                <Dati DBTabella="indirizzi" title={$localize`Lista indirizzi IP`} dati={addressList.value} nomeTabella={"indirizzi"} OnModify={handleModify} OnDelete={handleDelete} funcReloadData={reloadData} onReloadRef={getREF}>
                                </Dati>
                                <ButtonAddLink nomePulsante={$localize`Aggiungi indirizzo`} href={loc.url.href.replace("view", "insert")}></ButtonAddLink>
                                <ImportCSV OnError={handleError} OnOk={handleOkay} nomeImport="indirizzi" />
                            </Table>



                        </div>)
                    :
                    <CRUDForm data={address} reloadFN={reloadFN} />


            }

            <PopupModal
                visible={showPreview.value}
                title={
                    <div class="flex items-center gap-2">
                        <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Formato richiesto per l'importazione CSV</span>
                        <span class="ml-2 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wide">CSV</span>
                    </div>
                }
                onClosing$={() => { showPreview.value = false; }}
            >
                <TableInfoCSV tableName="indirizzi"></TableInfoCSV>
            </PopupModal>
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

export const CRUDForm = component$(({ data, reloadFN }: { data?: RowAddress, reloadFN?: Signal<(() => void) | null> }) => {
    const lang = getLocale("en")
    const loc = useLocation();
    const nav = useNavigate();
    const action = useAction();

    const formData = useStore<RowAddress & { ipDest: string, prefix: string }>({
        tipo_dispositivo: 'Other',
        prefix: '',
        ip: '',
        ipDest: '',
        vid: undefined,
        idrete: undefined,
        nome_dispositivo: '',
        brand_dispositivo: '',
        data_inserimento: '',
    });

    const ipErrors = useSignal<string[]>([]);
    const ipDestErrors = useSignal<string[]>([]);

    const attempted = useSignal<boolean>(false);
    const changeIP = useSignal<boolean>(false);

    const networks = useSignal<ReteModel[]>([]);
    const vlans = useSignal<VLANModel[]>([]);

    const updateIP = useSignal<() => void>(() => { });

    const handleFUpdate = $((e: () => void) => updateIP.value = e);

    useTask$(async () => {

        networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
        vlans.value = await getAllVLAN();

        if (loc.params.mode == "update") {
            Object.assign(formData, data);
            if (formData.n_prefisso)
                formData.prefix = formData.n_prefisso.toString();
            if (data?.tipo_dispositivo == undefined)
                formData.tipo_dispositivo = 'Other'
            // console.log(formData);
        }
    })

    return (
        <>

            <div class="m-2 sm:grid sm:grid-cols-2 max-sm:*:my-2 gap-4 relative">
                <FormBox title="Informazioni">
                    <SelectForm id="cmbType" title="Tipologia: " name="Tipo Dispositivo" value={formData.tipo_dispositivo} OnClick$={(e) => { formData.tipo_dispositivo = (e.target as HTMLOptionElement).value; }} listName="">
                        <option value="Server" key="Server">Server</option>
                        <option value="Controller" key="Controller">Controller</option>
                        <option value="Router" key="Router">Router</option>
                        <option value="Firewall" key="Firewall">Firewall</option>
                        <option value="Other" key="Other">{$localize`Altro`}</option>
                    </SelectForm>
                    <TextboxForm id="txtName" title={$localize`Nome Dispositivo`} value={formData.nome_dispositivo} placeholder="Es. Server1" OnInput$={(e) => formData.nome_dispositivo = (e.target as HTMLInputElement).value} />
                    <TextboxForm id="txtModel" title={$localize`Marca Dispositivo`} value={formData.brand_dispositivo} placeholder="Es. Dell" OnInput$={(e) => formData.brand_dispositivo = (e.target as HTMLInputElement).value} />
                    <DatePicker id="dpData" name={$localize`Data inserimento`} value={formData.data_inserimento} OnInput$={(e) => formData.data_inserimento = (e.target as HTMLInputElement).value} />
                </FormBox>
                <FormBox title="Dettagli">

                    <AddressBox title={loc.params.mode === "update" ? (lang == "it" ? "IP Origine" : "IP Origin") : "IPv4"} addressType="host" forceUpdate$={handleFUpdate} currentIPNetwork={formData.idrete ?? -1} value={data?.ip} prefix={formData.prefix} OnInput$={(e) => {


                        if (e.complete) {
                            if (loc.params.mode == "update" && !e.exists)
                                e.errors.push(lang == "en" ? "The IP does not exists in current network." : "L'indirizzo IP non esiste in questa rete.")
                            else if (loc.params.mode == "insert" && e.exists)
                                e.errors.push(lang == "en" ? "This IP already exists." : "Questo IP esiste già")
                            else
                                formData.ip = e.ip;
                        }
                        if (formData.prefix == "")
                            formData.prefix = e.prefix;

                        ipErrors.value = e.errors;
                    }} />
                    {attempted.value && !formData.ip && <span class="text-red-600">{$localize`This IP Address is invalid`}</span>}

                    {ipErrors.value && <span class="text-red-600">{ipErrors.value.map((x: string) => <>{x}<br /></>)}</span>}

                    {
                        //#region ChangeIP
                        loc.params.mode === "update"
                        &&
                        changeIP.value
                        &&
                        <div class="flex flex-col">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 lg:ms-8 md:ms-6 sm:ms-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
                            </svg>
                            <AddressBox title="IP Dest" value={formData.ip} prefix={formData.prefix} currentIPNetwork={formData.idrete ?? -1} OnInput$={(e) => {
                                if (e.complete && e.errors.length == 0)
                                    formData.ipDest = e.ip;
                                if (formData.prefix == "")
                                    formData.prefix = e.prefix;

                                ipDestErrors.value = e.errors;
                            }} />
                        </div>
                        //#endregion
                    }

                    <TextboxForm id="txtPrefix" value={formData.prefix} disabled="disabled" title={$localize`Prefisso`} placeholder="Network Prefix" OnInput$={(e) => { formData.prefix = (e.target as any).value; }} />
                    {attempted.value && !formData.prefix && <span class="text-red-600">{$localize`This prefix is invalid`}</span>}

                    <SelectForm id="cmbRete" title="Rete" name={$localize`Rete Associata`} value={formData.idrete?.toString() || ""} OnClick$={async (e) => { formData.idrete = parseInt((e.target as any).value); formData.prefix = ((await getNetwork(formData.idrete)) as ReteModel).prefissorete.toString(); updateIP.value() }} listName="">
                        {networks.value.map((x: ReteModel) => <option key={x.idrete} value={x.idrete}>{x.nomerete}</option>)}
                    </SelectForm>
                    {attempted.value && !formData.idrete && <span class="text-red-600">{$localize`Please select a network`}</span>}

                    <SelectForm id="cmbVLAN" title="VLAN" name="VLAN" value={formData.vid?.toString() || ""} OnClick$={(e) => { formData.vid = parseInt((e.target as any).value); }} listName="">
                        {vlans.value.map((x: VLANModel) => <option key={x.vid} value={x.vid}>{x.nomevlan}</option>)}
                    </SelectForm>
                    {attempted.value && !formData.vid && <span class="text-red-600">{$localize`Please select a VLAN`}</span>}


                </FormBox>
                {loc.params.mode === "update"
                    &&
                    <button class="absolute top-16 -right-8" onClick$={() => { changeIP.value = !changeIP.value }}>
                        {
                            changeIP.value ?
                                (<div class="has-tooltip relative"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg> <span class="tooltip">{$localize`Remove`}</span> </div>)
                                :
                                (<div class="has-tooltip relative"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                                </svg> <span class="tooltip">{$localize`Change IP`}</span> </div>)
                        }

                    </button>
                }

            </div>
            <button onClick$={async (e) => {
                e.preventDefault();
                if (!formData.prefix || !formData.ip || !formData.idrete || !formData.vid) {
                    attempted.value = true;
                    if (isNaN(parseInt(formData.prefix)))
                        formData.prefix = "";
                    return;
                }
                await action.submit({ n_prefisso: parseInt(formData.prefix), ip: formData.ip, idrete: formData.idrete, vid: formData.vid, to_ip: changeIP.value ? formData.ipDest : formData.ip, mode: loc.params.mode, nome_dispositivo: formData.nome_dispositivo ?? "", tipo_dispositivo: formData.tipo_dispositivo ?? "", brand_dispositivo: formData.brand_dispositivo ?? "", data_inserimento: new Date(formData.data_inserimento ?? "").toString() == "Invalid Date" ? null : new Date(formData.data_inserimento!).toString() });
                if (action.value && action.value.success) {
                    await new Promise((resolve) => { setTimeout(resolve, 2000) });
                    window.location.href = loc.url.href.replace("insert", "view").replace("update", "view");
                }

            }} class="bg-green-500 transition-all hover:bg-green-600 disabled:bg-green-300 rounded-md text-white p-2 mx-1 ms-4" disabled={
                ipErrors.value.length > 0 ||
                ipDestErrors.value.length > 0 ||
                formData.ip == "" ||
                !formData.idrete ||
                !formData.vid ||
                formData.prefix == ""
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