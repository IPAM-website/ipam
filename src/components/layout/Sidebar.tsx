import { $, component$, getLocale, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import Accordion from "./Accordion/Accordion";
import { NavLink } from "../NavLink/NavLink";
import { RequestHandler, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { getBaseURL, getUser } from "~/fnUtils";

export const toggleSidebar = $(() => {
    const sidebar = document.getElementById('sidebar');
    const cover = document.getElementById('cover');
    if (sidebar) {
        sidebar.classList.toggle('w-[240px]');
        sidebar.classList.toggle('w-[0px]');
    }
    if (cover) {
        cover.classList.toggle('bg-black/10');
        cover.classList.toggle('hidden');
    }
    document.body.classList.toggle("overflow-hidden");
});

export const setClientName = $((clientName: string) => {
    const target = document.getElementsByClassName("client-name")[0];
    target.textContent = clientName;
})

export const setSiteName = $((siteName: string) => {
    const target = document.getElementsByClassName("site-name")[0];
    target.textContent = siteName;
})


export default component$(() => {
    const nav = useNavigate();
    const loc = useLocation();

    const user = useSignal<{mail:string,id:number,admin:boolean}>();
    useTask$(async ()=>{
        user.value = await getUser();
    })

    const lang = getLocale("en");
    const insideSS = loc.params.site;
    const baseSiteUrl = getBaseURL() + loc.params.client + '/' + loc.params.site + '/';
    return (
        <div>
            <div id="sidebar" class="overflow-hidden transition-all h-full fixed top-0 left-0 bg-white border-1 border-gray-200 w-[0px] z-20">
                <div class="w-[240px] p-2 h-full">

                    <div class=" bg-white h-full overflow-hidden flex flex-col">
                        <div>
                            <div class="client-name justify-center text-black text-[18pt] font-semibold font-['Inter'] leading-[40px]">
                                ---
                            </div>
                            <div class="site-name justify-center text-[#808080] text-[14pt] font-semibold font-['Inter'] leading-[20px]">
                                ---
                            </div>
                        </div>

                        <hr class="text-gray-300 my-2" />
                        {
                            insideSS ?
                                <div>
                                    <Accordion title={$localize`Indirizzi IP`}>
                                        <NavLink href={baseSiteUrl + "addresses/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Tutti gli indirizzi IP`}</NavLink>
                                        <NavLink href={baseSiteUrl + "addresses/insert"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Assegna un indirizzo IP`}</NavLink>
                                    </Accordion>

                                    <Accordion title={$localize`Intervalli IP`}>
                                        <NavLink href={baseSiteUrl + "intervals/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Tutti gli intervalli IP`}</NavLink>
                                        <NavLink href={baseSiteUrl + "intervals/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Crea un nuovo intervallo`}</NavLink>
                                    </Accordion>

                                    <Accordion title={$localize`Prefissi`}>
                                        <NavLink href={baseSiteUrl + "prefixes/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Tutti i prefissi`}</NavLink>
                                    </Accordion>

                                    <Accordion title={$localize`Aggregati`}>
                                        <NavLink href={baseSiteUrl + "aggregates/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Tutti gli aggregati`}</NavLink>
                                        <NavLink href={baseSiteUrl + "aggregates/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Crea un nuovo aggregato`}</NavLink>
                                    </Accordion>

                                    <Accordion title="VFR">
                                        <NavLink href={baseSiteUrl + "VFR/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Tutti i VFR`}</NavLink>
                                        <NavLink href={baseSiteUrl + "VFR/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Crea un nuovo VFR`}</NavLink>
                                    </Accordion>

                                    <Accordion title="VLAN">
                                        <NavLink href={baseSiteUrl + "VLAN/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Tutte le VLAN`}</NavLink>
                                        <NavLink href={baseSiteUrl + "VLAN/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6" onClick$={toggleSidebar}>{$localize`Crea una nuova VLAN`}</NavLink>
                                    </Accordion>
                                </div>
                                :
                                <div class="text-gray-600 text-sm my-1">
                                    {$localize`No options available here. Select a site from the dashboard to start.`}
                                </div>
                        }


                        <div>
                            <div class="flex-1 my-3 text-center justify-start text-black text-base font-semibold font-['Inter'] leading-normal">{$localize`Other`}</div>


                            <a href={"/" + lang + "/dashboard"} class="block cursor-pointer text-center p-1 bg-[#0094ff] hover:bg-[#0083ee] rounded-lg text-white text-base font-['Inter'] leading-normal">
                                {$localize`Change client`}
                            </a>

                            {
                                loc.params.client &&
                                <a href={baseSiteUrl.replace(loc.params.site + "/", "")} class="block cursor-pointer my-1 text-center p-1 bg-[#d506ff] hover:bg-[#c405ee] rounded-lg text-white text-base font-['Inter'] leading-normal">
                                    {$localize`Change site`}
                                </a>
                            }

                            {
                                user.value?.admin
                                &&
                                <a href={"/" + lang + "/admin/panel"} class="block cursor-pointer my-1 text-center p-1 bg-[#ff8936] hover:bg-[#ee7825] rounded-lg text-white text-base font-['Inter'] leading-normal">
                                    {$localize`Admin Panel`}
                                </a>
                            }
                        </div>


                        <div class="h-full"></div>

                        <div>
                            <div class="text-[#4f4f4f] text-sm font-['Inter']">{$localize`Logged as`} <br />
                                <span class="text-md text-black font-semibold">
                                    {user.value?.mail}
                                </span>
                            </div>

                            <button class="w-full block cursor-pointer my-1 text-center p-1 bg-gray-800 hover:bg-black rounded-lg text-white text-base font-medium font-['Inter'] leading-normal" onClick$={async () => {
                                await fetch("/api/cookie", { method: "DELETE" });
                                nav("/" + lang + "/login");
                            }}>{$localize`Logout`}</button>

                        </div>
                    </div>
                </div>
            </div>
            <div id="cover" class="transition-all fixed w-full h-full top-0 left-0 hidden z-10" onClick$={toggleSidebar}>

            </div>
        </div>
    )
});