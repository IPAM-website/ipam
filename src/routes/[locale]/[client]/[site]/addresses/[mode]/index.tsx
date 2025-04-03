import { $, component$, getLocale, Signal, Slot, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { RequestHandler, routeAction$, routeLoader$, server$, useContent, useLocation, useNavigate, z, zod$ } from "@builder.io/qwik-city";
import sql from "~/../db"
import AddressBox from "~/components/forms/formsComponents/AddressBox";
import DatePicker from "~/components/forms/formsComponents/DatePicker";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
import Title from "~/components/layout/Title";
import Network from "~/components/ListUtilities/NetworkList/networkModel";
import ButtonAddLink from "~/components/table/ButtonAddLink";
import Table from "~/components/table/Table";
import Subsite from "~/components/ListUtilities/SubSiteList/subsiteModel";
import Dati from "~/components/table/Dati_Headers";
import ImportCSV from "~/components/table/ImportCSV";

export const onRequest: RequestHandler = ({ params, redirect, url }) => {
    if (!['view', 'insert', 'update'].includes(params.mode)) {
        let splitURL = url.href.split('/');
        splitURL.pop();
        splitURL.pop();
        throw redirect(301, splitURL.join('/') + "/view")
    }
}

export interface AddressModel {
    ip: string,
    idrete: number,
    idv: number,
    n_prefisso: number
}

export interface VLAN {
    idv: number;
    nomevlan: string;
    descrizione: string;
}

export interface RowAddress {
    descrizione?: string,
    idrete?: number,
    idsito?: number,
    idsottosito?: number,
    idv?: number,
    ip?: string,
    n_prefisso?: number,
    nomerete?: string,
    nomesottosito?: string
}

type Notification = {
    message: string;
    type: 'success' | 'error';
};


export const useAddresses = server$(async function (this, filter = { type: "", value: "" }) {
    let addresses: AddressModel[] = [];
    if (this.query.has("network") || filter.type == "network") {
        const queryResult = await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.query.get("network") ?? filter.value}`;
        addresses = queryResult as unknown as AddressModel[];
    }
    else if (this.query.has("subsite") || filter.type == "subsite") {
        const queryResult = await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete INNER JOIN sottositi_rete ON rete.idrete=sottositi_rete.idrete
                                      AND sottositi_rete.idsottosito=${this.query.get("subsite") ?? filter.value}`;
        addresses = queryResult as unknown as AddressModel[];
    }
    else {
        const queryResult = await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete INNER JOIN sottositi_rete ON rete.idrete=sottositi_rete.idrete 
                                      INNER JOIN sotto_siti ON sottositi_rete.idsottosito=sotto_siti.idsottosito AND sotto_siti.idsito=${this.params.site};`;
        addresses = queryResult as unknown as AddressModel[];
    }

    return addresses;
})


export const useSiteName = routeLoader$(async ({ params }) => {
    return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0].nomesito;
})


export const useAction = routeAction$(async (data) => {
    let success = false;
    let type_message = 0;
    try {
        if (data.mode == "update") {
            await sql`UPDATE indirizzi SET ip=${data.to_ip}, idrete=${data.idrete}, idv=${data.idv}, n_prefisso=${data.n_prefisso} WHERE ip=${data.ip}`;
            type_message = 2;
        } else {
            await sql`INSERT INTO indirizzi(ip,idrete,idv,n_prefisso) VALUES (${data.ip},${data.idrete},${data.idv},${data.n_prefisso})`;
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
        idv: z.number().positive(),
        n_prefisso: z.number().positive().max(31).min(0),
        to_ip: z.string(),
        mode: z.string()
    }))


export const getAllVLAN = server$(async function () {
    let vlans: VLAN[] = [];
    try {
        const query = await sql`SELECT * FROM vlan`
        vlans = query as unknown as VLAN[];
    }
    catch (e) {
        console.log(e);
    }

    return vlans;
})

export const getAllNetworksBySite = server$(async function (idsito: number) {
    let networks: Network[] = [];
    try {
        const query = await sql`SELECT rete.* FROM rete INNER JOIN sottositi_rete ON rete.idrete=sottositi_rete.idrete 
                                INNER JOIN sotto_siti ON sottositi_rete.idsottosito=sotto_siti.idsottosito WHERE sotto_siti.idsito=${idsito}`
        networks = query as unknown as Network[];
    }
    catch (e) {
        console.log(e);
    }

    return networks;
})

export const useNetwork = server$(async function (idSottoSito: number) {
    let networkList: Network[] = [];
    try {
        const query = await sql`SELECT * FROM sottositi_rete INNER JOIN rete ON sottositi_rete.idrete = rete.idrete WHERE idsottosito = ${idSottoSito}`
        networkList = query as unknown as Network[];
    }
    catch (e) {
        console.log(e);
    }

    return networkList;
})

export const useSubSite = server$(async function (idSito: number) {
    let siteList: Subsite[] = [];
    try {
        const query = await sql`SELECT * FROM sotto_siti WHERE idsito = ${idSito}`
        siteList = query as unknown as Subsite[];
    }
    catch (e) {
        console.log(e);
    }

    return siteList;
})

export default component$(() => {
    const lang = getLocale("en");
    const addressList = useSignal<AddressModel[]>([]);
    const networks = useSignal<Network[]>([]);
    const subsites = useSignal<Subsite[]>([]);
    const loc = useLocation();
    const nav = useNavigate();
    const address = useStore<RowAddress>({});
    const sitename = useSiteName();
    const filter = useStore({ active: false, network: '', subsite: '' });
    const mode = loc.params.mode ?? "view";
    const notifications = useSignal<Notification[]>([]);

    useTask$(async () => {
        addressList.value = await useAddresses();
        subsites.value = await useSubSite(parseInt(loc.params.site));

        if (loc.url.searchParams.has("subsite"))
            filter.subsite = loc.url.searchParams.get("subsite") as string;
        if (loc.url.searchParams.has("network"))
            filter.network = loc.url.searchParams.get("network") as string;

        filter.active = (filter.network != '' || filter.subsite != '');
    })

    useTask$(async ({ track }) => {
        let subsite = track(() => filter.subsite);
        if (subsite)
            networks.value = await useNetwork(parseInt(subsite))
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

    const handleOk = $(async () => {
        addNotification(lang === "en" ? "Import completed successfully" : "Importazione completata con successo", 'success');
    })

    const handleModify = $((row: any) => {
        console.log(row);
        Object.assign(address, row as RowAddress);
        nav(loc.url.href.replace("view", "update"));
    })


    const handleDelete = $(()=>{});

    return (
        <>
            <Title> {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} IP</Title>
            {
                mode == "view"
                    ? <div>
                        <div style={{ display: filter.active ? "block" : "none" }} class="filter border border-gray-200 p-4 w-1/2 mx-auto shadow-lg ">
                            <div class="flex">
                                <h1 class="font-semibold mb-2 w-full">Filters</h1>
                                <button class="cursor-pointer" onClick$={() => { filter.active = false; }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div class="flex">
                                <div class="w-full">
                                    <span class="ms-2">Subsite</span>
                                    <SelectForm OnClick$={(e) => { filter.subsite = (e.target as HTMLOptionElement).value; }} value={filter.subsite} id="filter-subsite" name="" listName="Sottositi">
                                        {subsites.value.map((x: Subsite) => <option value={x.idsottosito}>{x.nomesottosito}</option>)}
                                    </SelectForm>
                                </div>
                                <div class="w-full">
                                    <span class="ms-2">Network</span>
                                    <SelectForm disabled={filter.subsite == ''} OnClick$={(e) => { filter.network = (e.target as HTMLOptionElement).value }} id="filter-network" name="" value={filter.network} listName="Reti">
                                        {networks.value.map((x: Network) => <option value={x.idrete}>{x.nomerete}</option>)}
                                    </SelectForm>
                                </div>
                            </div>
                            <div class="flex w-full mt-2">
                                <div class="flex-auto"></div>
                                <button class=" flex gap-1 items-center p-2 px-4 border-gray-300 hover:bg-gray-100 border cursor-pointer disabled:cursor-default text-gray-900 rounded-lg mx-2" disabled={filter.subsite == ''} onClick$={() => {
                                    window.location.href = loc.url.pathname;
                                }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                    Reset</button>

                                <button class="p-2 flex items-center gap-1 px-4 bg-black hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer disabled:cursor-default text-white rounded-md" disabled={filter.subsite == ''} onClick$={() => {
                                    // window.location.href = loc.url.pathname + (filter.network == '' ? ("?subsite=" + filter.subsite) : ("?network=" + filter.network));
                                    let url = loc.url.pathname + "?";
                                    let searchParams = new URLSearchParams();
                                    if (filter.subsite != '')
                                        searchParams.append("subsite", filter.subsite);
                                    if (filter.network != '')
                                        searchParams.append("network", filter.network);
                                    window.location.href = url + searchParams;
                                }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                    Search</button>

                            </div>
                        </div>

                        <Table>
                            <button class="cursor-pointer p-1 absolute top-5 left-38 rounded-md bg-black hover:bg-gray-700" onClick$={() => filter.active = !filter.active}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 text-white">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                </svg>
                            </button>

                            <Dati DBTabella="indirizzi" title={$localize`Lista indirizzi IP`} dati={addressList.value} nomeTabella={"indirizzi"} OnModify={handleModify} OnDelete={handleDelete}></Dati>
                            <ButtonAddLink nomePulsante={$localize`Aggiungi indirizzo`} href={loc.url.href.replace("view", "insert")}></ButtonAddLink>
                            <ImportCSV OnError={handleError} OnOk={handleOk} nomeImport="indirizzi" />
                        </Table>
                    </div>
                    :
                    <CRUDForm data={address} />
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


export const CRUDForm = component$(({ data }: { data?: RowAddress }) => {
    const lang = getLocale("en")
    const loc = useLocation();
    const nav = useNavigate();
    const action = useAction();

    const type = useSignal<string>("");
    const prefix = useSignal<string>("");
    const ip = useSignal<string>("");
    const ipDest = useSignal<string>("");
    const ipErrors = useSignal<string[]>([]);
    const ipDestErrors = useSignal<string[]>([]);
    const rete = useSignal<number>();
    const vlan = useSignal<number>();
    const attempted = useSignal<boolean>(false);
    const changeIP = useSignal<boolean>(false);

    const networks = useSignal<Network[]>([]);
    const vlans = useSignal<VLAN[]>([]);
    useTask$(async () => {

        networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
        vlans.value = await getAllVLAN();

        if (loc.params.mode == "update") {
            if (data?.n_prefisso) prefix.value = data?.n_prefisso?.toString();
            if (data?.idv) vlan.value = data.idv;
            if (data?.idrete) rete.value = data.idrete;
        }
    })

    return (
        <>

            <div class="m-2 sm:grid sm:grid-cols-2 max-sm:*:my-2 gap-4 relative">
                <FormBox title="Informazioni">
                    <SelectForm id="cmbType" name="Tipo Dispositivo" value="" OnClick$={(e) => { type.value = (e.target as HTMLOptionElement).value; }} listName="">
                        <option value="Server">Server</option>
                        <option value="Controller">Controller</option>
                        <option value="Router">Router</option>
                        <option value="Firewall">Firewall</option>
                        <option value="Other">{$localize`Altro`}</option>
                    </SelectForm>
                    <TextboxForm id="txtName" title={$localize`Nome Dispositivo`} placeholder="Es. Server1" />
                    <TextboxForm id="txtModel" title={$localize`Marca Dispositivo`} placeholder="Es. Dell" />
                    <DatePicker id="dpData" name={$localize`Data inserimento`} />
                </FormBox>
                <FormBox title="Dettagli">

                    <AddressBox title={loc.params.mode === "update" ? (lang == "it" ? "IP Origine" : "IP Origin") : "IPv4"} currentIPNetwork={rete.value ?? -1} value={data?.ip} prefix={prefix.value} OnInput$={(e) => {


                        if (e.complete) {
                            if (loc.params.mode == "update" && !e.exists)
                                e.errors.push(lang == "en" ? "The IP does not exists in current network." : "L'indirizzo IP non esiste in questa rete.")
                            else if (loc.params.mode == "insert" && e.exists)
                                e.errors.push(lang == "en" ? "This IP already exists." : "Questo IP esiste già")
                            else
                                ip.value = e.ip;
                        }
                        if (prefix.value == "")
                            prefix.value = e.prefix;

                        ipErrors.value = e.errors;
                    }} />
                    {attempted.value && !ip.value && <span class="text-red-600">{$localize`This IP Address is invalid`}</span>}

                    {ipErrors.value && <span class="text-red-600">{ipErrors.value.map((x: string) => <>{x}<br /></>)}</span>}

                    {
                        loc.params.mode === "update"
                        &&
                        changeIP.value
                        &&
                        <div class="flex flex-col">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 lg:ms-8 md:ms-6 sm:ms-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3" />
                            </svg>
                            <AddressBox title="IP Dest" value={ip.value} prefix={prefix.value} currentIPNetwork={rete.value ?? -1} OnInput$={(e) => {
                                if (e.complete && e.errors.length == 0)
                                    ipDest.value = e.ip;
                                if (prefix.value == "")
                                    prefix.value = e.prefix;

                                ipDestErrors.value = e.errors;
                            }} />
                        </div>
                    }

                    <TextboxForm id="txtName" value={prefix.value} title={$localize`Prefisso`} placeholder="Es. 24" OnInput$={(e) => { prefix.value = (e.target as HTMLInputElement).value }} />
                    {attempted.value && !prefix.value && <span class="text-red-600">{$localize`This prefix is invalid`}</span>}

                    <SelectForm id="cmbRete" name={$localize`Rete Associata`} value={rete.value?.toString() || ""} OnClick$={(e) => { rete.value = parseInt((e.target as HTMLOptionElement).value); }} listName="">
                        {networks.value.map((x: Network) => <option value={x.idrete}>{x.nomerete}</option>)}
                    </SelectForm>
                    {attempted.value && !rete.value && <span class="text-red-600">{$localize`Please select a network`}</span>}

                    <SelectForm id="cmbVLAN" name="VLAN" value={vlan.value?.toString() || ""} OnClick$={(e) => { vlan.value = parseInt((e.target as HTMLOptionElement).value); }} listName="">
                        {vlans.value.map((x: VLAN) => <option value={x.idv}>{x.nomevlan}</option>)}
                    </SelectForm>
                    {attempted.value && !vlan.value && <span class="text-red-600">{$localize`Please select a VLAN`}</span>}


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
                if (!prefix.value || !ip.value || !rete.value || !vlan.value) {
                    attempted.value = true;
                    if (isNaN(parseInt(prefix.value)))
                        prefix.value = "";
                    return;
                }
                await action.submit({ n_prefisso: parseInt(prefix.value), ip: ip.value, idrete: rete.value, idv: vlan.value, to_ip: changeIP.value ? ipDest.value : ip.value, mode: loc.params.mode });
                if (action.value && action.value.success) {
                    await new Promise((resolve) => { setTimeout(resolve, 2000) });
                    nav(loc.url.href.replace("insert", "view").replace("update", "view"));
                }

            }} class="bg-green-500 transition-all hover:bg-green-600 disabled:bg-green-300 rounded-md text-white p-2 mx-1 ms-4" disabled={
                ipErrors.value.length > 0 ||
                ipDestErrors.value.length > 0 ||
                ip.value == "" ||
                !rete.value ||
                !vlan.value ||
                prefix.value == ""
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