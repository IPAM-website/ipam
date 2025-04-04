import { component$, getLocale, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { server$, useLocation } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import ClientInfo from "~/components/ListUtilities/ClientList/clientinfo";
import SiteModel from "~/components/ListUtilities/SiteList/siteModel";
import { getBaseURL } from "~/fnUtils";
import sql from "../../../../../db";
import { setClientName, setSiteName } from "~/components/layout/Sidebar";
import DC from "~/components/ListUtilities/DCList/dcModel";
import { getAllDC, getAllSite } from "..";
import SubsiteModel from "~/components/ListUtilities/SubSiteList/subsiteModel";
import Network from "~/components/ListUtilities/NetworkList/networkModel";

export const getSite = server$(async function (idsito: number) {
    let site: SiteModel = { idsito: -1, nomesito: '' };
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
    let client: ClientInfo = { idcliente: -1, nomecliente: '' };
    try {
        const query = await sql`SELECT * FROM clienti WHERE clienti.idcliente=${idclient}`
        client = query[0] as ClientInfo;
    }
    catch (e) {
        console.log(e);
    }

    return client;
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


export const getAllSubSites = server$(async function (idsite: number) {
    let subsites: SubsiteModel[] = [];
    try {
        const query = await sql`SELECT * FROM sotto_siti WHERE sotto_siti.idsito=${idsite}`
        subsites = query as unknown as SubsiteModel[];
    }
    catch (e) {
        console.log(e);
    }

    return subsites;
})


export default component$(() => {

    const loc = useLocation();
    const lang = getLocale("en");
    const site = useSignal<SiteModel>();
    const client = useSignal<ClientInfo>();
    const subsites = useSignal<SubsiteModel[]>([]);
    const networks = useSignal<Network[]>([]);

    useTask$(async () => {
        client.value = await getClient(parseInt(loc.params.client));
        site.value = await getSite(parseInt(loc.params.site));
        subsites.value = await getAllSubSites(parseInt(loc.params.site));
        networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
    })

    useVisibleTask$(() => {
        if (client.value)
            setClientName(client.value.nomecliente);
        if (site.value)
            setSiteName(site.value.nomesito);
    })

    return (<>
        <div class="size-full bg-white overflow-hidden">
            <Title haveReturn={true} url={loc.url.origin + "/" + lang + "/" + client.value?.idcliente} >{client.value?.nomecliente + " - " + site.value?.nomesito}</Title>
            <div class="flex  flex-col md:flex-row gap-8 mt-8">

                <div class="w-full md:w-72 flex-4 px-5 py-3  rounded-lg border-1 border-gray-300 inline-flex flex-col justify-start items-start gap-1">
                    <div class="h-[50px] w-full flex items-center overflow-hidden">
                        <div class="text-black text-lg font-semibold">{$localize`Informazioni sul sito`}</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Nome`}</div>
                        <div class="justify-start text-black text-lg font-normal">{site.value?.nomesito}</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Posizione`}</div>
                        <div class="justify-start text-black text-lg font-normal">DA AGGIUNGERE!!!</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Numero sottositi`}</div>
                        <div class="justify-start text-black text-lg font-normal">{subsites.value.length}</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Reti presenti`}</div>
                        <div class="justify-start text-black text-lg font-normal">{networks.value.length}</div>
                    </div>
                </div>

                <div class="flex-initial max-md:w-60 mx-auto rounded-lg border-1 border-[#cdcdcd]">
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
    </>)
})