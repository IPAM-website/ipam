import { $, component$, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { server$, useLocation } from "@builder.io/qwik-city";
import sql from "~/../db";
import Title from "~/components/layout/Title";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
import { CittaModel, ClienteModel, PaeseModel, SiteModel } from "~/dbModels";
import Accordion from "~/components/layout/Accordion/Accordion";

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

export const getCountries = server$(async function () {
    try {
        const query = await sql`SELECT * FROM paesi`
        return query as unknown as PaeseModel[];
    }
    catch (e) {
        console.log(e);
    }

    return [];
})

export const getCitiesOfClients = server$(async function (idcliente: number) {
    try {
        const query = await sql`SELECT citta.* FROM citta INNER JOIN siti ON citta.idcitta=siti.idsito WHERE siti.idcliente=${idcliente}`;
        return query as unknown as CittaModel[];
    } catch (e) {
        console.log(e);
    }

    return [];
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
    const sites = useSignal<SiteModel[]>([]);
    const selected = useSignal<number>(-1);
    const client = useSignal<ClienteModel>();
    const countries = useSignal<PaeseModel[]>();
    const cities = useSignal<CittaModel[]>();

    const dcUpdateMode = useSignal<boolean>(false);
    const dcAddMode = useSignal<boolean>(false);
    const siteUpdateMode = useSignal<boolean>(false);
    const siteAddMode = useSignal<boolean>(false);

    useTask$(async () => {
        client.value = await getClient(parseInt(loc.params.client));
        cities.value = await getCitiesOfClients(parseInt(loc.params.client));
        countries.value = await getCountries();
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
                        {
                            cities.value && countries.value && cities.value?.length > 0 ? countries.value.map((x: PaeseModel) => {

                                const filterCity = cities.value?.filter(j=>x.idpaese==j.idpaese);
                                if(filterCity?.length==0)
                                    return;

                                return (<Accordion title={x.nomepaese}>
                                    {filterCity?.map(j=><div>{j.nomecitta}</div>)}
                                </Accordion>)
                            })
                                :
                                <div>
                                    Non ci sono paesi associati
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
                    {selected.value !== -1 && (

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
                </div>
            </div>
        </>
    )
})