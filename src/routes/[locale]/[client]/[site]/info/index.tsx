import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import { getBaseURL } from "~/fnUtils";
import sql from "~/../db";
import { ReteModel } from "~/dbModels";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import SiteNavigator from "~/components/layout/SiteNavigator";

export const useSiteName = routeLoader$(async ({ params }) => {
    return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0].nomesito;
})

export const useSiteNet = routeLoader$(async ({ params }) => {
    return (await sql`SELECT * FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE idsito = ${params.site}`) as ReteModel[];
})

export const useNet = server$(async function () {
    if (!this.query.has("network"))
        return;
    return (await sql`SELECT * FROM rete WHERE idrete = ${this.query.get('network')}`)[0] as ReteModel;
})

export const getNetworkSpace = server$(async (idrete: number) => {
    try {
        const query = (await sql`SELECT * FROM rete WHERE rete.idretesup = ${idrete} ORDER BY iprete`) as ReteModel[];
        let result = 0;

        for (const r of query) {
            result += Math.pow(2, r.prefissorete);
        }
        result += (await sql`SELECT * FROM indirizzi WHERE indirizzi.idrete = ${idrete}`).length;

        return result;
    }
    catch (e) {
        console.log(e);
        return ["ERROR"];
    }
})

export const getParentNetwork = server$(async (idrete: number) => {
    try {
        const query = (await sql`SELECT r2.* FROM rete INNER JOIN rete as r2 ON rete.idretesup=r2.idrete WHERE rete.idrete = ${idrete}`)[0] as ReteModel;
        return query;
    }
    catch (e) {
        console.log(e);
        return ["ERROR"];
    }
})

export const getChildrenNetworks = server$(async (idrete: number) => {
    try {
        const query = (await sql`SELECT * FROM rete WHERE rete.idretesup = ${idrete}`) as ReteModel[];
        console.log(query);
        return query;
    }
    catch (e) {
        console.log(e);
        return ["ERROR"];
    }
})

export default component$(() => {
    const loc = useLocation();
    const nav = useNavigate();
    const sitename = useSiteName();
    const siteNetworks = useSiteNet();
    const network = useSignal<ReteModel>();
    const allocatedSpace = useSignal<number>(0);
    const parentNetwork = useSignal<ReteModel>();
    const childrenNetworks = useSignal<ReteModel[]>();

    useTask$(async () => {
        network.value = await useNet();
        if (network.value) {
            allocatedSpace.value = await getNetworkSpace(network.value.idrete) as number;
            parentNetwork.value = await getParentNetwork(network.value.idrete) as ReteModel;
            childrenNetworks.value = await getChildrenNetworks(network.value.idrete) as ReteModel[];
        }
    })

    const siteURL = getBaseURL() + loc.params.client + "/" + loc.params.site;


    return (
        <div>
            <Title haveReturn={true} url={loc.url.pathname.split('info')[0]} > {sitename.value.toString()} IP</Title>
            <SiteNavigator />

            <SelectForm OnClick$={async (e) => {
                const idrete = (e.target as HTMLOptionElement).value;
                network.value = (await server$(async () => {
                    return (await sql`SELECT * FROM rete WHERE idrete=${idrete}`)[0] as ReteModel;
                })())
                childrenNetworks.value = await getChildrenNetworks(parseInt(idrete)) as ReteModel[];
                parentNetwork.value = await getParentNetwork(parseInt(idrete)) as ReteModel;
                nav("?network=" + idrete)
            }} id="" name="" value={loc.url.searchParams.get('network') ?? ""} >
                {siteNetworks.value.map(x => <option value={x.idrete}>{x.nomerete}</option>)}
            </SelectForm>

            {network.value ? <div class="flex gap-4">
                <div class="flex-1 px-5 py-3 mt-4 rounded-md border-1 border-gray-300 inline-flex flex-col justify-start items-start gap-1">
                    <div class="h-[50px] w-full flex items-center overflow-hidden">
                        <div class="text-black text-lg font-semibold">{$localize`Informazioni sulla rete`}</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`IP`}</div>
                        <div class="justify-start text-black text-lg font-normal">{network.value.iprete}</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Prefisso`}</div>
                        <div class="justify-start text-black text-lg font-normal">{network.value.prefissorete}</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Total Allocation Space`}</div>
                        <div class="justify-start text-black text-lg font-normal">{Math.pow(2, 32 - network.value.prefissorete) - 2}</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Allocated Space`}</div>
                        <div class="justify-start text-black text-lg font-normal">{allocatedSpace.value}</div>
                    </div>
                    <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Remaining Allocation Space`}</div>
                        <div class="justify-start text-black text-lg font-normal">{Math.pow(2, 32 - network.value.prefissorete) - 2 - allocatedSpace.value}</div>
                    </div>
                </div>
                <div class="flex-1 px-5 py-3 mt-4 rounded-md border-1 border-gray-300 inline-flex flex-col justify-start items-start gap-1">
                    <div class="h-[50px] w-full flex items-center overflow-hidden">
                        <div class="text-black text-lg font-semibold">{$localize`Relatives components`}</div>
                    </div>
                    {parentNetwork.value && <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-lg font-normal">{$localize`Parent Network`}</div>
                        <div class="justify-start text-black text-lg font-normal">{parentNetwork.value?.iprete}</div>
                    </div>}
                    {childrenNetworks.value && childrenNetworks.value.length > 0 &&
                        <div class="px-2 py-2.5 border-t w-full border-gray-300 inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-lg font-normal">{$localize`Childrens`}</div>
                            <div class="justify-start text-black text-lg font-normal">
                                {childrenNetworks.value.map(x => <p>{x.iprete}</p>)}
                            </div>
                        </div>}
                </div>
            </div> :
                <div class="w-full mt-2 rounded-2xl border border-gray-300 p-2 flex items-center justify-center min-h-[400px]">
                    <p class="text-gray-500">{$localize`Select a network to see its info`}</p>
                </div>}
        </div>

    )
})