import { $, component$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { server$, useLocation } from "@builder.io/qwik-city";
import DC from "~/components/ListUtilities/DCList/dcModel";
import sql from "~/../db";
import SiteModel from "~/components/ListUtilities/SiteList/siteModel";
import Title from "~/components/layout/Title";
import ClientInfo from "~/components/ListUtilities/ClientList/clientinfo";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";


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

export const insertDC = server$(async function (nomedc: string) {
    if (nomedc == "")
        return false;
    try {
        await sql`INSERT INTO datacenter(nomedc,idcliente) VALUES (${nomedc},${this.params.client})`
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
})

export const insertSite = server$(async function (nomesito: string, idcitta: number, iddc: number) {
    try {
        const query = await sql`SELECT idsito FROM siti ORDER BY idsito DESC LIMIT 1`;
        const lastID = query[0].idsito + 1;
        await sql`INSERT INTO siti(idsito,nomesito,idcitta,iddc) VALUES (${lastID},${nomesito},${idcitta},${iddc})`
        return true;
    }
    catch (e) {
        console.log(e);
        return false;
    }
})

export default component$(() => {
    const loc = useLocation();
    const datacenters = useSignal<DC[]>([]);
    const sites = useSignal<SiteModel[]>([]);
    const selectedDatacenter = useSignal<number>(-1);
    const client = useSignal<ClientInfo>();

    const dcUpdateMode = useSignal<boolean>(false);
    const dcAddMode = useSignal<boolean>(false);
    const siteUpdateMode = useSignal<boolean>(false);
    const siteAddMode = useSignal<boolean>(false);

    const newDCName = useSignal("");
    const newSiteName = useSignal("");

    useTask$(async ({ track }) => {
        client.value = await getClient(parseInt(loc.params.client));
        datacenters.value = await getAllDC(parseInt(loc.params.client));
        sites.value = await getAllSite(track(() => selectedDatacenter.value));
    })

    const handleDCClick = $(() => {
        if (dcUpdateMode.value) {
            dcUpdateMode.value = false;
            dcAddMode.value = false;
        }
        else
            dcUpdateMode.value = true;
    })

    const handleSiteClick = $(() => {
        if (siteUpdateMode.value) {
            siteUpdateMode.value = false;
            siteAddMode.value = false;
        }
        else
            siteUpdateMode.value = true;
    })

    return (
        <>
            <Title haveReturn={true} url={loc.url.origin}>{client.value?.nomecliente}</Title>
            <br />
            <div class="flex flex-col gap-2 md:flex-row">
                <div class="md:w-1/4 mx-auto md:h-[60vh] flex flex-col shadow p-2 md:p-3 rounded-md border border-gray-200">
                    <p class="font-medium flex justify-between text-sm py-2">
                        {$localize`All Datacenters`}
                        <button onClick$={handleDCClick} class="rounded-[50%] p-1" style={{ backgroundColor: dcUpdateMode.value ? "#ddd" : "" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
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
                        {
                            dcUpdateMode.value && !dcAddMode.value &&
                            <button onClick$={() => dcAddMode.value = true} class="text-sm w-full text-center cursor-pointer bg-white py-1 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none rounded transition">
                                + Add
                            </button>
                        }
                        {
                            dcAddMode.value &&
                            <div>
                                <TextboxForm id="txtDC" placeholder="Datacenter Name" css={{ height: "36px", fontSize: "10pt", borderRadius: "2px" }} OnInput$={(e) => newDCName.value = (e.target as HTMLInputElement).value} />
                                <div class="flex max-md:flex-col gap-2">
                                    <button onClick$={async() => { await insertDC(newDCName.value); datacenters.value = await getAllDC(parseInt(loc.params.client)); dcAddMode.value=false; }} class="text-sm w-full text-center text-white cursor-pointer bg-black py-1 hover:bg-gray-800 focus:bg-gray-700 focus:outline-none rounded transition">
                                        Confirm
                                    </button>
                                    <button onClick$={() => dcAddMode.value = false} class="text-sm w-full text-center cursor-pointer bg-white border-1 border-gray-800 py-1 hover:bg-gray-100 hover:border-gray-700 focus:bg-gray-200 focus:outline-none rounded transition">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <div class="md:w-3/4 md:h-[60vh] mx-5 flex flex-col shadow p-3 rounded-md border border-gray-200">
                    <p class="font-medium flex justify-between text-sm py-2">
                        {$localize`All Sites`}
                        <button onClick$={handleSiteClick} class="rounded-[50%] p-1" style={{ backgroundColor: siteUpdateMode.value ? "#ddd" : "" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                        </button>
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
                        siteUpdateMode.value && !siteAddMode.value &&
                        <button onClick$={() => siteAddMode.value = true} class="text-sm w-full text-center cursor-pointer bg-white py-1 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none rounded transition">
                            + Add
                        </button>
                    }
                    {
                        siteAddMode.value &&
                        <div>
                            <TextboxForm id="txtSite" placeholder="Site Name" css={{ height: "36px", fontSize: "10pt", borderRadius: "2px" }} OnInput$={(e) => newDCName.value = (e.target as HTMLInputElement).value} />
                            <div class="flex max-md:flex-col gap-2">
                                <button onClick$={async ()=>{ siteAddMode.value=false }} class="text-sm w-full text-center text-white cursor-pointer bg-black py-1 hover:bg-gray-800 focus:bg-gray-700 focus:outline-none rounded transition">
                                    Confirm
                                </button>
                                <button onClick$={() => siteAddMode.value = false} class="text-sm w-full text-center cursor-pointer bg-white border-1 border-gray-800 py-1 hover:bg-gray-100 hover:border-gray-700 focus:bg-gray-200 focus:outline-none rounded transition">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    }

                    {
                        !siteUpdateMode.value
                        &&
                        selectedDatacenter.value == -1
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