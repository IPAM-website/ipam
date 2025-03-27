import { $, component$, getLocale, useSignal, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import Accordion from "./Accordion/Accordion";
import { NavLink } from "../NavLink/NavLink";
import { RequestHandler, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import User from "~/routes/user";
import jwt from "jsonwebtoken"
import { trace } from "console";

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

export const useUser = server$(function () {
    return this.sharedMap.get('user') as User;
});


export default component$(() => {
    const user = useSignal<User>();
    const nav = useNavigate();
    const loc = useLocation();

    useTask$(async () => {
        user.value = await useUser();
    })

    const lang = getLocale("en");
    const insideSS = loc.url.search.split('&').length==4

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
                                    <NavLink href={"/" + lang + "/addresses/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Tutti gli indirizzi IP`}</NavLink>
                                    <NavLink href={"/" + lang + "/addresses/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Assegna un indirizzo IP`}</NavLink>
                                </Accordion>

                                <Accordion title={$localize`Intervalli IP`}>
                                    <NavLink href={"/" + lang + "/intervals/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Tutti gli intervalli IP`}</NavLink>
                                    <NavLink href={"/" + lang + "/intervals/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Crea un nuovo intervallo`}</NavLink>
                                </Accordion>

                                <Accordion title={$localize`Prefissi`}>
                                    <NavLink href={"/" + lang + "/prefixes/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Tutti i prefissi`}</NavLink>
                                </Accordion>

                                <Accordion title={$localize`Aggregati`}>
                                    <NavLink href={"/" + lang + "/aggregates/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Tutti gli aggregati`}</NavLink>
                                    <NavLink href={"/" + lang + "/aggregates/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Crea un nuovo aggregato`}</NavLink>
                                </Accordion>

                                <Accordion title="VFR">
                                    <NavLink href={"/" + lang + "/VFR/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Tutti i VFR`}</NavLink>
                                    <NavLink href={"/" + lang + "/VFR/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Crea un nuovo VFR`}</NavLink>
                                </Accordion>

                                <Accordion title="VLAN">
                                    <NavLink href={"/" + lang + "/VLAN/view"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Tutte le VLAN`}</NavLink>
                                    <NavLink href={"/" + lang + "/VLAN/create"} activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">{$localize`Crea una nuova VLAN`}</NavLink>
                                </Accordion>
                            </div>
                            :
                            <div class="text-gray-600 text-sm my-1">
                                {$localize`No options available here. Select a site from the dashboard to start.`}
                            </div>
                        }


                        <div>
                            <div class="flex-1 my-3 text-center justify-start text-black text-base font-semibold font-['Inter'] leading-normal">{$localize`Other`}</div>

                            <a href={loc.url.search.split("&site")[0]} class="block cursor-pointer my-1 text-center p-1 bg-[#d506ff] hover:bg-[#c405ee] rounded-lg text-white text-base font-['Inter'] leading-normal">
                                {$localize`Change site`}
                            </a>

                            <a href={"/" + lang + "/dashboard"} class="block cursor-pointer text-center p-1 bg-[#0094ff] hover:bg-[#0083ee] rounded-lg text-white text-base font-['Inter'] leading-normal">
                                {$localize`Change client`}
                            </a>

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