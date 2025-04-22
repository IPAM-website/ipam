import { $, component$, getLocale, useSignal, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { Form, routeAction$, server$, useLocation, useNavigate, z, zod$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import { getBaseURL } from "~/fnUtils";
import sql from "../../../../../db";
import { setClientName, setSiteName } from "~/components/layout/Sidebar";
import { getAllSite } from "..";
import { CittaModel, ClienteModel, ReteModel, SiteModel, VLANModel, VRFModel } from "~/dbModels";
import Table from "~/components/table/Table";
import Dati_Headers from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import PopupModal from "~/components/ui/PopupModal";
import AddressBox from "~/components/forms/formsComponents/AddressBox";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import FMButton from "~/components/forms/formsComponents/FMButton";
import CHKForms from "~/components/forms/CHKForms";

export const getSite = server$(async function (idsito: number) {
    let site: SiteModel = { idsito: -1, nomesito: '', datacenter: false, idcitta: 0, tipologia: '' };
    try {
        const query = await sql`SELECT * FROM siti WHERE siti.idsito=${idsito}`
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
    idretesup: z.number().optional()
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
    const city = useSignal<CittaModel>();

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

    const hasParent = useSignal<boolean>(false);
    const IPreteSup = useSignal<string>("");
    const reloadFN = useSignal<() => void | undefined>();

    useTask$(async () => {
        client.value = await getClient(parseInt(loc.params.client));
        site.value = await getSite(parseInt(loc.params.site));
        networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
        vrfs.value = await getAllVRF();
        vlans.value = await getAllVLAN();
        city.value = await getCity(parseInt(loc.params.site));
    })

    const handleDelete = $((e: any) => {
        deleteNetwork(e.idrete)
    })

    const handleModify = $((e: any) => {
        Object.assign(formData, e);
        hasParent.value = formData.idretesup != undefined;
        netMode.value = 2;
        console.log(formData.idretesup);
    })

    const getReloader = $((e: () => void) => {
        reloadFN.value = e;
    })

    const handleRowClick = $((row: any) => {
        nav(loc.url + "addresses/view?network=" + row.idrete);
    })

    return (<>
        <div class="size-full bg-white overflow-hidden">
            <Title haveReturn={true} url={loc.url.origin + "/" + lang + "/" + client.value?.idcliente} >{client.value?.nomecliente + " - " + site.value?.nomesito}</Title>
            <div>
                <Table title="Networks">
                    <Dati_Headers DBTabella="rete" title={lang == 'en' ? "Networks" : "Reti"} dati={networks.value} nomeTabella={lang == 'en' ? "networks" : "reti"} onReloadRef={getReloader} funcReloadData={reloadData} OnModify={handleModify} OnDelete={handleDelete} onRowClick={handleRowClick} />
                    <ButtonAdd nomePulsante={$localize`Aggiungi rete`} onClick$={() => {
                        Object.assign(formData, {
                            descrizione: "",
                            idrete: 0,
                            nomerete: "",
                            vrf: 1,
                            iprete: "",
                            prefissorete: 0,
                            idv: 1,
                            idretesup: false
                        })
                        hasParent.value = false;
                        broadcastIP.value = "";
                        netMode.value = 1;
                    }} ></ButtonAdd>
                </Table>
            </div>
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
            </div>
        </div>

        <PopupModal visible={netMode.value != 0} title={netMode.value == 1 ? $localize`Aggiunta network` : $localize`Aggiorna network`} onClosing$={() => { netMode.value = 0 }}>
            <Form onSubmit$={async () => {
                if (netMode.value == 1) {
                    //@ts-ignore
                    await insertAction.submit({ descrizione: formData.descrizione, nomerete: formData.nomerete, vrf: formData.vrf, iprete: formData.iprete, vid: formData.idv ?? 1, prefissorete: formData.prefissorete, idretesup: formData.idretesup })
                    if (insertAction.value?.success) {
                        netMode.value = 0;
                        reloadFN.value?.();
                    }
                    else
                        console.log(insertAction.value?.message);
                }
                else if (netMode.value == 2) {
                    //@ts-ignore
                    await updateAction.submit({ descrizione: formData.descrizione, nomerete: formData.nomerete, vrf: formData.vrf, iprete: formData.iprete, vid: formData.idv ?? 1, prefissorete: formData.prefissorete, idretesup: formData.idretesup, idrete: formData.idrete })
                    if (updateAction.value?.success) {
                        netMode.value = 0;
                        reloadFN.value?.();
                    }
                    else
                        console.log(updateAction.value?.message);
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
                    <AddressBox addressType="network" currentID={formData.idrete} title={$localize`Indirizzo di rete`} value={formData.iprete} currentIPNetwork={formData.idretesup} prefix={formData.prefissorete.toString()} OnInput$={e => {
                        console.log(e);
                        ipErrors.value = e.errors
                        ipCompleted.value = e.complete;
                        if (e.complete) {
                            if (formData.prefissorete == 0)
                                formData.prefissorete = parseInt(e.class)
                            broadcastIP.value = e.last;
                            if (e.errors.length == 0 && ipCompleted.value) {
                                formData.iprete = e.ip;
                            }
                            console.log(formData.iprete)
                        }

                        networks.value = [...networks.value]

                        attempted.value = e.complete;

                    }}></AddressBox>
                    {attempted.value && ipErrors.value.length > 0 && ipErrors.value.map(x => <p class="w-full text-red-500 text-end">{x}</p>)}
                    <AddressBox title={$localize`Indirizzo di broadcast`} disabled={true} value={broadcastIP.value} ></AddressBox>
                </div>
                <div class="**:flex-1">
                    <TextboxForm id="txtPrefix" value={formData.prefissorete == 0 ? "" : formData.prefissorete.toString()} title={$localize`Prefisso`} placeholder="Es. 24" OnInput$={(e) => { formData.prefissorete = (e.target as any).value; }} />
                    {attempted.value && (formData.prefissorete < 1 || formData.prefissorete > 31) && <span class="text-red-600">{$localize`This prefix is invalid`}</span>}
                </div>
                <SelectForm id="cmbVLAN" title="VLAN" name="VLAN" value={formData.vid?.toString() || ""} OnClick$={(e) => { formData.vid = parseInt((e.target as any).value); }} listName="">
                    {vlans.value.map((x: VLANModel) => <option key={x.idv} about={x.descrizionevlan} value={x.idv}>{x.nomevlan}</option>)}
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
                        <SelectForm id="" value={formData.idretesup?.toString() ?? ""} name="" title={$localize`Rete Container`} OnClick$={(e) => { formData.idretesup = parseInt((e.target as HTMLOptionElement).value); IPreteSup.value = (e.target as HTMLOptionElement).innerText }}>

                            {networks.value.filter(x => {

                                if (!ipCompleted.value)
                                    return true;
                                if (x.prefissorete >= formData.prefissorete)
                                    return false;

                                let xIP = x.iprete.split('.');
                                let formIP = formData.iprete.split('.');

                                return (
                                    (x.prefissorete >= 24 && xIP[2] == formIP[2] && xIP[3] <= formIP[3])
                                    ||
                                    (x.prefissorete >= 16 && x.prefissorete < 24 && xIP[1] == formIP[1] && xIP[2] <= formIP[2])
                                    ||
                                    (x.prefissorete >= 8 && x.prefissorete < 16 && xIP[0] == formIP[0] && xIP[1] <= formIP[1])
                                    ||
                                    (x.prefissorete < 8 && xIP[0] <= formIP[0])
                                )
                                {/* @ts-ignore */ }
                            }).map(x => <option value={x.idrete} about={x.descrizione}>{x.iprete}/{x.prefissorete.toString()}  - {x.nomerete}</option>)}
                        </SelectForm>
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