import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { getBaseURL } from "~/fnUtils";
import SelectForm from "../forms/formsComponents/SelectForm";
import { ReteModel } from "~/dbModels";
import sql from "../../../db";

export const useNetworks = server$(async function () {
    return (await sql`SELECT * FROM rete INNER JOIN siti_rete ON rete.idrete = siti_rete.idrete WHERE siti_rete.idsito = ${this.params.site}`) as ReteModel[];
})

export default component$(({networkChange$}: {networkChange$?: (idrete: string) => void}) => {

    const nav = useNavigate();
    const loc = useLocation();

    const siteNetworks = useSignal<ReteModel[]>([]);

    const siteURL = getBaseURL() + loc.params.client + "/" + loc.params.site;
    const networkURL = getBaseURL() + loc.params.client + "/" + loc.params.site + "/" + loc.params.network;

    const smartRedirect = $((path: string) => {
        if (loc.url.href.includes(path)) return;
        nav(networkURL + path)
    })

    useTask$(async () => {
        siteNetworks.value = await useNetworks();
    })

    return (<div class="flex flex-col md:flex-row gap-8">
        <div class="flex justify-between items-center w-full">
            <nav class="bg-gray-50 rounded-xl mt-2">
                <ul class="flex space-x-4">
                    <li>
                        <button onClick$={() => smartRedirect("/info")} class="text-gray-700 block hover:text-gray-500 p-4">Info</button>
                    </li>
                    <li>
                        <button onClick$={() => smartRedirect("/addresses")} class="text-gray-700 hover:text-gray-500 block p-4">Addresses</button>
                    </li>
                    <li>
                        <button onClick$={() => smartRedirect("/aggregates")} class="text-gray-700 hover:text-gray-500 block p-4">Aggregate</button>
                    </li>
                    {/* <li>
                        <button onClick$={() => smartRedirect("/prefixes")} class="text-gray-700 hover:text-gray-500 block p-4">Prefixes</button>
                    </li> */}
                    <li>
                        <button onClick$={() => smartRedirect("/intervals")} class="text-gray-700 hover:text-gray-500 block p-4">Intervals</button>
                    </li>
                    <li>
                        <button onClick$={() => smartRedirect("/vrf")} class="text-gray-700 hover:text-gray-500 block p-4">VRF</button>
                    </li>
                    <li>
                        <button onClick$={() => smartRedirect("/vlan")} class="text-gray-700 hover:text-gray-500 block p-4">VLANs</button>
                    </li>
                    <li>
                        <button onClick$={() => smartRedirect("/settings")} class="text-gray-700 hover:text-gray-500 block p-4" >Settings</button>
                    </li>
                </ul>
            </nav>

            <div class="flex items-center gap-0">

                <span class="text-sm">
                    Network:
                </span>
                <SelectForm value={loc.params.network} noPointer={true} OnClick$={async (e) => {
                    if (!(e.target instanceof HTMLOptionElement))
                        return;
                    const idrete = (e.target as HTMLOptionElement).value;
                    const urlParts = loc.url.pathname.split('/');
                    nav(`${getBaseURL()}${loc.params.client}/${loc.params.site}/${idrete}/${urlParts.slice(5).join('/')}`)
                    if(networkChange$)
                        networkChange$(idrete);
                }} id="" name="" >
                    {siteNetworks.value.map(x => <option value={x.idrete}>{x.nomerete}</option>)}
                </SelectForm>
            </div>
        </div>

    </div>)
})