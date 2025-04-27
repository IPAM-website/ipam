import { $, component$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { getBaseURL } from "~/fnUtils";

export default component$(() => {

    const nav = useNavigate();
    const loc = useLocation();

    const siteURL = getBaseURL() + loc.params.client + "/" + loc.params.site;

    const smartRedirect = $((path: string) => {
        if (loc.url.href.includes(path)) return;
        nav(siteURL + path + '/' + loc.url.search)
    })

    return (<div class="flex flex-col md:flex-row gap-8">
        <div class="row">
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
        </div>

    </div>)
})