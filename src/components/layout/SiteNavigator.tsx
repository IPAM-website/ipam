import { $, component$, useSignal, useStyles$, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { getBaseURL } from "~/fnUtils";
import SelectForm from "../forms/formsComponents/SelectForm";
import { ReteModel } from "~/dbModels";
import cssStyle from "./SiteNavigator.css?inline"
import sql from "../../../db";

export const useNetworks = server$(async function () {
    return (await sql`SELECT * FROM rete INNER JOIN siti_rete ON rete.idrete = siti_rete.idrete WHERE siti_rete.idsito = ${this.params.site}`) as ReteModel[];
})

export default component$(({ networkChange$, onPageChange$ = () => { } }: { networkChange$?: (idrete: string) => void, onPageChange$?: () => void }) => {
    useStyles$(cssStyle);

    const nav = useNavigate();
    const loc = useLocation();

    const refnav = useSignal<HTMLDivElement>();

    const siteNetworks = useSignal<ReteModel[]>([]);

    const siteURL = getBaseURL() + loc.params.client + "/" + loc.params.site;


    const smartRedirect = $((path: string) => {
        if (loc.url.href.includes(path)) return;
        const networkURL = getBaseURL() + loc.params.client + "/" + loc.params.site + "/" + loc.params.network;
        onPageChange$();
        nav(networkURL + path)
    })

    const navVisible = useSignal(false);
    const navClosing = useSignal(false);


    useTask$(async () => {
        siteNetworks.value = await useNetworks();
    })


    const toggleNav = $(() => {
        if (!navVisible.value) {
            if (refnav.value)
                refnav.value.style.display = "block";
            navVisible.value = true;
            navClosing.value = false;
        } else {
            navClosing.value = true;
            setTimeout(() => {
                navVisible.value = false;
                navClosing.value = false;
                if (refnav.value)
                    refnav.value.style.display = "none";
            }, 300); // durata animazione in ms
        }
    })




    return (<div class="flex flex-col md:flex-row gap-4">
        <div class="flex xl:flex-row flex-col max-xl:gap-2 justify-between items-center w-full">
            <button class="block mt-3 sm:hidden bg-blue-600 text-white font-semibold rounded-lg shadow-md px-4 py-2 transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                onClick$={toggleNav} aria-expanded aria-controls="">
                MENU
            </button>

            <nav ref={refnav} class={
                "bg-white rounded-xl mt-4 shadow px-2 py-1 max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:hidden sm:block " +
                (navClosing.value ? "hideFullScreen" : "showFullScreen")} >
                <ul class="sm:flex space-x-1 overflow-x-hidden *:w-full **:w-full ">
                    <li>
                        <button
                            onClick$={() => smartRedirect("/info")}
                            class={`px-4 py-2 rounded-lg font-medium transition-all 
               hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
               active:bg-blue-200
               border border-transparent ` + (loc.url.pathname.includes("/info") ? " bg-blue-200 text-blue-800" : "text-gray-700")}
                        >
                            Info
                        </button>
                    </li>
                    <li>
                        <span class="w-px h-6 bg-gray-200 self-center"></span>
                    </li>
                    <li>
                        <button
                            onClick$={() => smartRedirect("/addresses")}
                            class={`px-4 py-2 rounded-lg font-medium transition-all 
               hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
               active:bg-blue-200
               border border-transparent ` + (loc.url.pathname.includes("/addresses") ? " bg-blue-200 text-blue-800" : "text-gray-700")}
                        >
                            Addresses
                        </button>
                    </li>
                    <li>
                        <span class="w-px h-6 bg-gray-200 self-center"></span>
                    </li>
                    <li>
                        <button
                            onClick$={() => smartRedirect("/aggregates")}
                            class={`px-4 py-2 rounded-lg font-medium transition-all 
               hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
               active:bg-blue-200
               border border-transparent ` + (loc.url.pathname.includes("/aggregates") ? " bg-blue-200 text-blue-800" : "text-gray-700")}
                        >
                            Aggregate
                        </button>
                    </li>
                    <li>
                        <span class="w-px h-6 bg-gray-200 self-center"></span>
                    </li>
                    <li>
                        <button
                            onClick$={() => smartRedirect("/intervals")}
                            class={`px-4 py-2 rounded-lg font-medium transition-all 
               hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
               active:bg-blue-200
               border border-transparent ` + (loc.url.pathname.includes("/intervals") ? " bg-blue-200 text-blue-800" : "text-gray-700")}
                        >
                            Intervals
                        </button>
                    </li>
                    <li>
                        <span class="w-px h-6 bg-gray-200 self-center"></span>
                    </li>
                    <li>
                        <button
                            onClick$={() => smartRedirect("/vrf")}
                            class={`px-4 py-2 rounded-lg font-medium transition-all 
               hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
               active:bg-blue-200
               border border-transparent ` + (loc.url.pathname.includes("/vrf") ? " bg-blue-200 text-blue-800" : "text-gray-700")}
                        >
                            VRF
                        </button>
                    </li>
                    <li>
                        <span class="w-px h-6 bg-gray-200 self-center"></span>
                    </li>
                    <li>
                        <button
                            onClick$={() => smartRedirect("/vlan")}
                            class={`px-4 py-2 rounded-lg font-medium transition-all 
               hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
               active:bg-blue-200
               border border-transparent ` + (loc.url.pathname.includes("/vlan") ? " bg-blue-200 text-blue-800" : "text-gray-700")}
                        >
                            VLANs
                        </button>
                    </li>
                    <li>
                        <span class="w-px h-6 bg-gray-200 self-center"></span>
                    </li>
                    {/* <li>
                        <button
                            onClick$={() => smartRedirect("/settings")}
                            class={`px-4 py-2 rounded-lg font-medium transition 
               hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
               active:bg-blue-200
               border border-transparent ` + (loc.url.pathname.includes("/settings") ? " bg-blue-200 text-blue-800" : "text-gray-700")}
                        >
                            Settings
                        </button>
                    </li> */}
                </ul>
            </nav>



            <div class="flex items-center gap-0 relative showFullScreen max-sm:mt-1">

                <span class="text-md">
                    Network:
                </span>

                <SelectForm value={loc.params.network != '0' ? loc.params.network : ""} errorNotification={{ condition: (loc.params.network == '0'), text: "Select a network" }} noPointer={true} OnClick$={async (e) => {
                    if (!(e.target instanceof HTMLOptionElement))
                        return;
                    const idrete = (e.target as HTMLOptionElement).value;
                    const urlParts = loc.url.pathname.split('/');
                    nav(`${getBaseURL()}${loc.params.client}/${loc.params.site}/${idrete}/${urlParts.slice(5).join('/')}`)
                    if (networkChange$)
                        networkChange$(idrete);
                }} id="" name="" >
                    {siteNetworks.value.map(x => <option value={x.idrete}>{x.nomerete}</option>)}
                </SelectForm>

            </div>
        </div>

    </div>)
})