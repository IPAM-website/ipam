import { $, component$, getLocale, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, server$, useLocation, useNavigate, z, zod$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import sql from "../../../../../db";
import { CittaModel, ClienteModel, ReteModel, SiteModel, VLANModel, VRFModel } from "~/dbModels";
import Table from "~/components/table/Table";
import Dati_Headers from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import PopupModal from "~/components/ui/PopupModal";
import AddressBox from "~/components/forms/formsComponents/AddressBox";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import FMButton from "~/components/forms/formsComponents/FMButton";
import CHKForms from "~/components/forms/formsComponents/CHKForms";
import SelectFormLive from "~/components/forms/formsComponents/SelectFormLive";
import BtnInfoTable from "~/components/table/btnInfoTable";

type Notification = {
    message: string;
    type: 'success' | 'error';
};

export const getSite = server$(async function (idsito: number) {
    let site: SiteModel = { idsito: -1, nomesito: '', datacenter: false, idcitta: 0, tipologia: '' };
    try {
        const query = await sql`SELECT * FROM siti WHERE siti.idsito=${idsito}`;
        site = query[0] as SiteModel;
    }
    catch (e) {
        console.log(e);
    }

    return site;
})

export const getClient = server$(async function (idclient: number) {
    let client: ClienteModel = { idcliente: -1, nomecliente: '', telefonocliente: '' };
    try {
        const query = await sql`SELECT * FROM clienti WHERE clienti.idcliente=${idclient}`
        client = query[0] as ClienteModel;
    }
    catch (e) {
        console.log(e);
    }

    return client;
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

export const getAllVRF = server$(async () => {
    let vrf: VRFModel[] = [];
    try {
        const query = await sql`SELECT * FROM vrf`
        vrf = query as unknown as VRFModel[];
    }
    catch (e) {
        console.log(e);
    }

    return vrf;
})

export const getAllVLAN = server$(async function () {
    let vlans: VLANModel[] = [];
    try {
        const query = await sql`SELECT * FROM vlan`
        console.log(query)
        vlans = query as unknown as VLANModel[];
    }
    catch (e) {
        console.log(e);
    }

    return vlans;
})

export const deleteNetwork = server$(async function (data) {
    try {
        await sql`DELETE FROM siti_rete WHERE siti_rete.idrete = ${data}`;
        await sql`DELETE FROM rete WHERE rete.idrete = ${data}`;
        return {
            success: true
        }
    } catch (e) {
        console.log(e);
        return {
            success: false
        }
    }
})


export const insertNetwork = routeAction$(async function (data, e) {
    try {
        if (data.idretesup)
            await sql`INSERT INTO rete (nomerete,descrizione,vrf,iprete,prefissorete,idretesup,vid) VALUES (${data.nomerete},${data.descrizione},${data.vrf},${data.iprete},${data.prefissorete},${data.idretesup},${data.vid})`;
        else
            await sql`INSERT INTO rete (nomerete,descrizione,vrf,iprete,prefissorete,vid) VALUES (${data.nomerete},${data.descrizione},${data.vrf},${data.iprete},${data.prefissorete},${data.vid})`;
        const id = (await sql`SELECT idrete FROM rete ORDER BY idrete DESC LIMIT 1`)[0].idrete;
        await sql`INSERT INTO siti_rete VALUES (${e.params.site},${id})`;

        const isDatacenter = (await sql`SELECT datacenter FROM siti WHERE idsito = ${e.params.site}`)[0].datacenter;
        if (isDatacenter) {
            const allDatacenters = (await sql`SELECT idsito FROM siti WHERE datacenter=true AND tipologia!='disaster recovery' AND idcliente = ${e.params.client}`).map(x => x.idsito).filter(x => x != e.params.site);
            for (const dc of allDatacenters) {
                await sql`INSERT INTO siti_rete VALUES (${dc},${id})`;
            }
        }
        return {
            success: true,
            message: ''
        }
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: ''
        }
    }
}, zod$({
    descrizione: z.string(),
    nomerete: z.string(),
    vrf: z.number(),
    iprete: z.string(),
    prefissorete: z.any(),
    vid: z.number(),
    idretesup: z.number().optional().nullable()
}))

export const updateNetwork = routeAction$(async function (data, e) {
    try {
        if (data.idretesup)
            await sql`UPDATE rete SET nomerete = ${data.nomerete}, descrizione = ${data.descrizione}, vrf = ${data.vrf}, prefissorete = ${data.prefissorete}, idretesup = ${data.idretesup} , iprete = ${data.iprete}, vid = ${data.vid} WHERE idrete = ${data.idrete}`;
        else
            await sql`UPDATE rete SET nomerete = ${data.nomerete}, descrizione = ${data.descrizione}, vrf = ${data.vrf}, prefissorete = ${data.prefissorete} , iprete = ${data.iprete}, vid = ${data.vid} WHERE idrete = ${data.idrete}`;

        return {
            success: true,
            message: ''
        }
    } catch (e) {
        console.log(e);
        return {
            success: false,
            message: ''
        }
    }
}, zod$({
    descrizione: z.string(),
    nomerete: z.string(),
    vrf: z.number(),
    iprete: z.string(),
    idrete: z.number(),
    prefissorete: z.any(),
    vid: z.number(),
    idretesup: z.number().optional().nullable()
}))

export const getCity = server$(async function (data) {
    return (await sql`SELECT citta.* FROM citta INNER JOIN siti ON citta.idcitta=siti.idcitta WHERE siti.idsito=${data}`)[0] as unknown as CittaModel;
})

export const reloadData = server$(async function () {
    return (await sql`SELECT rete.* FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site}`) as unknown as ReteModel[];
})


export default component$(() => {

    const loc = useLocation();
    const nav = useNavigate();
    const lang = getLocale("en");
    const site = useSignal<SiteModel>();
    const client = useSignal<ClienteModel>();
    const networks = useSignal<ReteModel[]>([]);
    const filteredNetworks = useSignal<ReteModel[]>([]);
    const city = useSignal<CittaModel>();

    const page = useSignal<string>("address")

    const insertAction = insertNetwork();
    const updateAction = updateNetwork();
    const formData = useStore<ReteModel>({
        descrizione: "",
        idrete: 0,
        nomerete: "",
        vrf: 1,
        iprete: "",
        prefissorete: 0,
        vid: 1
    })
    const broadcastIP = useSignal<string>("");
    const ipErrors = useSignal<string[]>([]);
    const ipCompleted = useSignal<boolean>(false);
    const attempted = useSignal<boolean>(false);
    const netMode = useSignal<number>(0);
    const vrfs = useSignal<VRFModel[]>([]);
    const vlans = useSignal<VLANModel[]>([]);

    const personalizedPrefix = useSignal<boolean>(false);

    const hasParent = useSignal<boolean>(false);
    const IPreteSup = useSignal<string>("");
    const reloadFN = useSignal<() => void | undefined>();

    const notifications = useSignal<Notification[]>([]);

    const updateAddr1 = useSignal<() => void>(() => { });
    const updateAddr2 = useSignal<() => void>(() => { });
    const updateParents = useSignal<() => void>(() => { });

    const displayParent = $((row: any) => {
        const x = row as ReteModel;
        return `${x.iprete}/${x.prefissorete.toString()} - ${x.nomerete}`
    })

    useTask$(async () => {
        client.value = await getClient(parseInt(loc.params.client));
        site.value = await getSite(parseInt(loc.params.site));
        networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
        vrfs.value = await getAllVRF();
        vlans.value = await getAllVLAN();
        city.value = await getCity(parseInt(loc.params.site));
    })

    useTask$(({ track }) => {
        track(() => formData.iprete)
        track(() => formData.prefissorete)
        track(() => networks.value)
        // console.log("re caloclo")
        filteredNetworks.value = networks.value.filter(x => {
            if (!ipCompleted.value)
                return true;
            if (x.prefissorete >= formData.prefissorete)
                return false;

            let xIP = x.iprete.split('.');
            let formIP = formData.iprete.split('.');

            console.log(xIP,formIP);

            return (
                (x.prefissorete >= 24 && xIP[2] == formIP[2] && xIP[3] <= formIP[3])
                ||
                (x.prefissorete >= 16 && x.prefissorete < 24 && xIP[1] == formIP[1] && xIP[2] <= formIP[2])
                ||
                (x.prefissorete >= 8 && x.prefissorete < 16 && xIP[0] == formIP[0] && xIP[1] <= formIP[1])
                ||
                (x.prefissorete < 8 && xIP[0] <= formIP[0])
            )
        })
    })

    const addNotification = $((message: string, type: 'success' | 'error') => {
        notifications.value = [...notifications.value, { message, type }];
        // Rimuovi la notifica dopo 3 secondi
        setTimeout(() => {
            notifications.value = notifications.value.filter(n => n.message !== message);
        }, 3000);
    });

    const handleDelete = $(async (e: any) => {
        if ((await deleteNetwork(e.idrete)).success)
            addNotification(lang === "en" ? "Record deleted successfully" : "Dato eliminato con successo", 'success');
        else
            addNotification(lang === "en" ? "Error during deleting" : "Errore durante la eliminazione", 'error');
        // console.log("COME?")
    })

    const handleModify = $((e: any) => {
        Object.assign(formData, e);
        hasParent.value = formData.idretesup != undefined;
        netMode.value = 2;
        personalizedPrefix.value = false;
        if(updateAddr1.value)
            updateAddr1.value();
    })

    const getReloader = $((e: () => void) => {
        reloadFN.value = e;
    })

    const handleRowClick = $((row: any) => {
        nav(loc.url.pathname + row.idrete + "/info");
    })

    const handleNavClick = $((e: PointerEvent) => {
        page.value = (e.target as HTMLOptionElement).value.toString() || "address";
    })


    const prefixBox = useSignal<HTMLInputElement>();


    return (<>
        <div class="size-full bg-white overflow-hidden">

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

            <Title haveReturn={true} url={loc.url.origin + "/" + lang + "/" + client.value?.idcliente} >{client.value?.nomecliente + " - " + site.value?.nomesito}</Title>
            <nav class="w-full flex cursor-pointer mt-2 rounded-lg *:p-2 *:px-4 *:hover:bg-gray-100 *:bg-gray-50">
                <option value="address" onClick$={handleNavClick}>Table</option>
                <option value="info" onClick$={handleNavClick}>Info</option>
            </nav>
            {page.value == 'address' &&
                <div>
                    <Table>
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 bg-gray-50 px-4 py-3 rounded-t-xl border-b border-gray-200">
                            <div class="flex items-center gap-2">
                                <span class="font-semibold text-lg text-gray-800">{$localize`Networks`}</span>
                            </div>
                        </div>
                        <Dati_Headers DBTabella="rete" dati={networks.value} nomeTabella={lang == 'en' ? "networks" : "reti"} onReloadRef={getReloader} funcReloadData={reloadData} OnModify={handleModify} OnDelete={handleDelete} onRowClick={handleRowClick} />
                        <ButtonAdd nomePulsante={$localize`Aggiungi rete`} onClick$={() => {
                            Object.assign(formData, {
                                descrizione: "",
                                idrete: 0,
                                nomerete: "",
                                vrf: 1,
                                iprete: "",
                                prefissorete: 0,
                                vid: 1,
                                idretesup: null
                            })
                            personalizedPrefix.value = false;
                            hasParent.value = false;
                            broadcastIP.value = "";
                            netMode.value = 1;
                            if (updateAddr2.value)
                                updateAddr2.value();
                        }} ></ButtonAdd>
                    </Table>
                </div>}
            {page.value == 'info' &&
                <div class="flex  flex-col md:flex-row gap-8 mt-8">

                    <div class="flex-1 px-5 py-3  rounded-md border-1 border-gray-300 inline-flex flex-col justify-start items-start gap-1">
                        <div class="h-[50px] w-full flex items-center overflow-hidden">
                            <div class="text-black text-lg font-semibold">{$localize`Informazioni sul sito`}</div>
                        </div>
                        <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-lg font-normal">{$localize`Nome`}</div>
                            <div class="justify-start text-black text-lg font-normal">{site.value?.nomesito}</div>
                        </div>
                        <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-lg font-normal">{$localize`Posizione`}</div>
                            <div class="justify-start text-black text-lg font-normal">{city.value?.nomecitta}</div>
                        </div>
                        <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-lg font-normal">{$localize`Reti presenti`}</div>
                            <div class="justify-start text-black text-lg font-normal">{networks.value.length}</div>
                        </div>
                    </div>

                    <div class="flex-initial max-md:w-60 mx-auto rounded-md border-1 border-[#cdcdcd]">
                        <div class="flex-1 flex flex-col *:p-3 *:px-10 cursor-pointer">
                            <div class="flex flex-1 border-b border-[#f3f3f3]">
                                <div class="text-center w-full text-black text-base font-semibold font-['Inter']">{$localize`Viste`}</div>
                            </div>
                            <a href="addresses/view" class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                {$localize`Indirizzi IP`}
                            </a>
                            <a href="intervals/view" class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                {$localize`Intervalli IP`}
                            </a>
                            <a href="prefixes/view" class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                {$localize`Prefissi`}
                            </a>
                            <a href="aggregates/view" class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                {$localize`Aggregati`}
                            </a>
                            <a href="vfr/view" class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                VFR
                            </a>
                            <a href="vlan/view" class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                VLAN
                            </a>
                        </div>
                    </div>
                </div>}
        </div>

        <PopupModal visible={netMode.value != 0} title={netMode.value == 1 ? $localize`Aggiunta network` : $localize`Aggiorna network`} onClosing$={() => { netMode.value = 0 }}>
            <Form onSubmit$={async () => {
                if (netMode.value == 1) {
                    
                    await insertAction.submit({ descrizione: formData.descrizione, nomerete: formData.nomerete, vrf: formData.vrf, iprete: formData.iprete, vid: formData.vid ?? 1, prefissorete: formData.prefissorete, idretesup: formData.idretesup })
                    if (insertAction.value?.success) {
                        netMode.value = 0;
                        reloadFN.value?.();
                        addNotification("Network added successfully", "success");
                    }
                    else {
                        // console.log(insertAction.value?.message);
                        addNotification("Error during creation", "error");
                    }
                }
                else if (netMode.value == 2) {
                    
                    await updateAction.submit({ descrizione: formData.descrizione, nomerete: formData.nomerete, vrf: formData.vrf, iprete: formData.iprete, vid: formData.vid ?? 1, prefissorete: formData.prefissorete, idretesup: formData.idretesup, idrete: formData.idrete })
                    if (updateAction.value?.success) {
                        netMode.value = 0;
                        reloadFN.value?.();
                        addNotification("Network updated successfully", "success");
                    }
                    else {
                        // console.log(updateAction.value?.message);
                        addNotification("Error during update", "error");
                    }
                }

            }}>
                <div class="**:flex-1">
                    <TextboxForm id="txtName" title={$localize`Nome`} value={formData.nomerete} placeholder={$localize`Nome della rete`} OnInput$={(e) => { formData.nomerete = (e.target as any).value; }} />
                </div>
                <div>
                    <h3 class="font-semibold">{$localize`Descrizione`}</h3>
                    <textarea
                        value={formData.descrizione}
                        id="descrizione"
                        class="w-full p-2 border border-gray-300 rounded-md outline-0 focus:border-black"
                        placeholder={$localize`Inserisci una descrizione`}
                        onInput$={e => formData.descrizione = (e.target as HTMLTextAreaElement).value}
                    ></textarea>
                </div>
                <div class="**:flex-1 w-full justify-between">
                    <AddressBox addressType="network" currentID={formData.idrete} title={$localize`Indirizzo di rete`} value={formData.iprete} currentIPNetwork={formData.idretesup} prefix={formData.prefissorete.toString()} forceUpdate$={e => updateAddr1.value = e} siteID={parseInt(loc.params.site)} OnInput$={e => {
                        ipErrors.value = e.errors
                        ipCompleted.value = e.complete;

                        if (e.complete) {
                            if (formData.prefissorete == 0)
                                formData.prefissorete = parseInt(e.class)
                            broadcastIP.value = e.last;
                            updateAddr2.value();

                            if (netMode.value == 2 && !e.exists)
                                e.errors.push(lang == "en" ? "The IP does not exists in current network." : "L'indirizzo IP non esiste in questa rete.")
                            else if (netMode.value == 1 && e.exists)
                                e.errors.push(lang == "en" ? "This IP already exists." : "Questo IP esiste già")

                            formData.iprete = e.ip;
                        }

                        networks.value = [...networks.value]

                        attempted.value = e.complete;

                    }}></AddressBox>
                    {attempted.value && ipErrors.value.length > 0 && ipErrors.value.map(x => <p class="w-full text-red-500 text-end">{x}</p>)}
                    <AddressBox title={$localize`Indirizzo di broadcast`} forceUpdate$={e => updateAddr2.value = e} disabled={true} value={broadcastIP.value} ></AddressBox>
                </div>
                <div class="**:flex-1">
                    <TextboxForm id="txtPrefix" value={formData.prefissorete == 0 || personalizedPrefix.value ? prefixBox.value?.value : formData.prefissorete.toString()} title={$localize`Prefisso`} ref={prefixBox} placeholder="Es. 24" OnInput$={(e) => { formData.prefissorete = (e.target as any).value; personalizedPrefix.value = true; updateAddr1.value()     }} />
                    {personalizedPrefix.value && (formData.prefissorete < 1 || formData.prefissorete > 31) && <span class="text-red-600">{$localize`This prefix is invalid`}</span>}
                </div>
                <SelectForm id="cmbVLAN" title="VLAN" name="VLAN" value={formData.vid?.toString() || ""} OnClick$={(e) => { console.log((e.target as HTMLOptionElement).value);formData.vid = parseInt((e.target as HTMLOptionElement).value); }} listName="">
                    {vlans.value.map((x: VLANModel) => <option key={x.vid} about={x.descrizionevlan} value={x.vid}>{x.nomevlan}</option>)}
                </SelectForm>
                {attempted.value && !formData.vid && <span class="text-red-600">{$localize`Please select a VLAN`}</span>}
                <SelectForm id="txtVRF" name="vrf" value={formData.vrf?.toString() || ""} title="VRF" OnClick$={(e) => { formData.vrf = parseInt((e.target as HTMLOptionElement).value) }}>
                    {vrfs.value.length > 0 && vrfs.value.map(x => <option value={x.idvrf} about={x.descrizionevrf}>{x.nomevrf}</option>)}
                </SelectForm>
                {insertAction.submitted && <p>{insertAction.value?.fieldErrors?.vid}</p>}
                {insertAction.submitted && <p>{insertAction.value?.formErrors}</p>}
                <div class="flex">
                    <div class="flex justify-center items-center">
                        <CHKForms id="" name="" value={formData.idretesup != undefined} nameCHK={$localize`Sottorete`} setValue={hasParent}></CHKForms>
                    </div>

                </div>
                {hasParent.value &&
                    <div class="flex flex-col border border-gray-200 justify-center items-center *:block w-full">
                        {/* <SelectForm id="" value={formData.idretesup?.toString() ?? ""} name="" title={$localize`Rete Container`} OnClick$={(e) => { formData.idretesup = parseInt((e.target as HTMLOptionElement).value); IPreteSup.value = (e.target as HTMLOptionElement).innerText }}>
                            {filteredNetworks.value.length!=0 && filteredNetworks.value.map(x => (
                                <option value={x.idrete} about={x.descrizione}>
                                    {`${x.iprete}/${x.prefissorete.toString()} - ${x.nomerete}`}
                                </option>
                            ))}
                        </SelectForm> */}
                        <SelectFormLive data={filteredNetworks.value} valueMember="idrete" displayMember={displayParent} id="" value={formData.idretesup?.toString() ?? ""} name="" title={$localize`Rete Container`} OnClick$={(e) => { formData.idretesup = parseInt((e.target as HTMLOptionElement).value); IPreteSup.value = (e.target as HTMLOptionElement).innerText }} />
                    </div>}
                <div class="w-full flex justify-end">
                    <input type="submit" class="rounded-md bg-black text-white disabled:bg-gray-600 disabled:cursor-default p-2 w-1/2 cursor-pointer hover:bg-gray-900 active:bg-gray-800" value={$localize`Conferma`} disabled={
                        formData.descrizione == '' ||
                        !ipCompleted.value ||
                        formData.nomerete == '' ||
                        !(formData.prefissorete > 0 && formData.prefissorete < 32) ||
                        ipErrors.value.length > 0 ||
                        (!formData.idretesup && hasParent.value)
                    } />
                </div>

            </Form>
        </PopupModal>
    </>)
})