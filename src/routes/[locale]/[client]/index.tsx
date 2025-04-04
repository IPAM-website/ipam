import { component$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { server$, useLocation } from "@builder.io/qwik-city";
import DC from "~/components/ListUtilities/DCList/dcModel";
import sql from "~/../db";
import SiteModel from "~/components/ListUtilities/SiteList/siteModel";
import Title from "~/components/layout/Title";
import ClientInfo from "~/components/ListUtilities/ClientList/clientinfo";


export const getAllDC = server$(async function (idclient: number) {
    let dcList: DC[] = [];
    try {
        const query = await sql`SELECT * FROM datacenter WHERE datacenter.idcliente=${idclient}`
        dcList = query as unknown as DC[];
    }
    catch (e) {
        console.log(e);
    }

    return dcList;
})

export const getAllSite = server$(async function (iddc: number) {
    let siteList: SiteModel[] = [];
    try {
        const query = await sql`SELECT * FROM siti WHERE siti.iddc=${iddc}`
        siteList = query as unknown as SiteModel[];
    }
    catch (e) {
        console.log(e);
    }

    return siteList;
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

export default component$(() => {
    const loc = useLocation();
    const datacenters = useSignal<DC[]>([]);
    const sites = useSignal<SiteModel[]>([]);
    const selectedDatacenter = useSignal<number>(-1);
    const client = useSignal<ClientInfo>();

    useTask$(async ({ track }) => {
        client.value = await getClient(parseInt(loc.params.client));
        datacenters.value = await getAllDC(parseInt(loc.params.client));
        sites.value = await getAllSite(track(() => selectedDatacenter.value));
    })

    return (
        <>
            <Title haveReturn={true} url={loc.url.origin}>{client.value?.nomecliente}</Title>
            <br />
            <div class="flex">
                <div class="w-1/4 h-[60vh] flex flex-col shadow p-3 rounded-md border border-gray-200">
                    <p class="font-medium text-sm py-2">
                        {$localize`All Datacenters`}
                    </p>
                    <hr class="text-gray-300 mb-2" />
                    <div class="space-y-1 overflow-y-auto">
                        {datacenters.value.map((x: DC) => (
                            <button
                                onClick$={() => {
                                    selectedDatacenter.value = x.iddc;
                                }}
                                class="w-full text-left cursor-pointer px-2 py-1 text-sm bg-white hover:bg-gray-100 focus:bg-gray-200 focus:outline-none rounded transition"
                            >
                                {x.nomedc}
                            </button>
                        ))}
                    </div>
                </div>
                <div class="w-3/4 h-[60vh] ms-5 flex flex-col shadow p-3 rounded-md border border-gray-200 overflow-y-auto">
                    <p class="font-medium text-sm py-2">
                        {$localize`All Sites`}
                    </p>
                    <hr class="border-gray-200 mb-2" />
                    {selectedDatacenter.value !== -1 && (

                        <div class="space-y-1">
                            {sites.value.map((x: SiteModel) => (
                                <a
                                    href={`${x.idsito}/`}
                                    class="block text-sm text-blue-600 hover:underline"
                                >
                                    {x.nomesito}
                                </a>
                            ))}
                        </div>
                    )}
                    {
                        selectedDatacenter.value==-1
                        &&
                        <div class="size-full flex justify-center items-center text-gray-400">
                            {$localize`Select a Datacenter to see its sites`}
                        </div>
                    }
                </div>
            </div>
        </>
    )
})