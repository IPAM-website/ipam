import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import Accordion from "./Accordion/Accordion";
import { NavLink } from "../NavLink/NavLink";
import { server$, useNavigate } from "@builder.io/qwik-city";
import User from "~/routes/user";

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
    const body = document.body.classList.toggle("overflow-hidden")
})

export const useUser = server$(function () {
    return this.sharedMap.get('user') as User;
});

export default component$(() => {
    const cliente = useSignal("Nome Cliente")
    const sito = useSignal("Sito Cliente")
    const user = useSignal<User>()
    const nav = useNavigate();
    useTask$(async () => {
        user.value = await useUser();
    })
    return (
        <div>
            <div id="sidebar" class="overflow-hidden transition-all h-full fixed top-0 left-0 bg-white rounded-br-3xl rounded-tr-3xl border-1 border-gray-200 w-[0px] z-20">
                <div class="w-[240px] p-2  h-full">

                    <div class=" bg-white rounded-tr-[20px] rounded-br-[20px] h-full overflow-hidden flex flex-col">
                        <div>
                            <div class="justify-center text-black text-[18pt] font-semibold font-['Inter'] leading-[40px]">
                                {cliente.value}
                            </div>
                            <div class="justify-center text-[#808080] text-[14pt] font-semibold font-['Inter'] leading-[20px]">
                                {sito.value}
                            </div>
                        </div>

                        <div>
                            
                            <Accordion title="Indirizzi IP">
                                <NavLink href="/addresses/view" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Tutti gli indirizzi IP</NavLink>
                                <NavLink href="/addresses/create" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Assegna un indirizzo IP</NavLink>
                            </Accordion>

                            <Accordion title="Intervalli IP">
                                <NavLink href="/intervals/view" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Tutti gli intervalli IP</NavLink>
                                <NavLink href="/intervals/create" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Crea un nuovo intervallo</NavLink>
                            </Accordion>

                            <Accordion title="Prefissi">
                                <NavLink href="/prefixes/view" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Tutti i prefissi</NavLink>
                            </Accordion>

                            <Accordion title="Aggregati">
                                <NavLink href="/aggregates/view" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Tutti gli aggregati</NavLink>
                                <NavLink href="/aggregates/create" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Crea un nuovo aggregato</NavLink>
                            </Accordion>

                            <Accordion title="VFR">
                                <NavLink href="/VFR/view" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Tutti i VFR</NavLink>
                                <NavLink href="/VFR/create" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Crea un nuovo VFR</NavLink>
                            </Accordion>

                            <Accordion title="VLAN">
                                <NavLink href="/VLAN/view" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Tutte le VLAN</NavLink>
                                <NavLink href="/VLAN/create" activeClass="text-black" class="block hover:text-black text-[#827d7d] text-sm font-semibold font-['Inter'] leading-6">Crea una nuova VLAN</NavLink>
                            </Accordion>
                        </div>

                        <div>
                            <div class="flex-1 my-2 text-center justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Other</div>

                            <a href="/client" class="block cursor-pointer my-1 text-center p-1 bg-[#d506ff] hover:bg-[#c405ee] rounded-lg text-white text-base font-['Inter'] leading-normal">
                                Change site
                            </a>

                            {
                                user.value?.admin
                                &&
                                <a href="/admin/panel" class="block cursor-pointer my-1 text-center p-1 bg-[#ff8936] hover:bg-[#ee7825] rounded-lg text-white text-base font-['Inter'] leading-normal">
                                    Admin Panel
                                </a>
                            }
                        </div>


                        <div class="h-full"></div>

                        <div>
                            <div class="text-[#4f4f4f] text-sm font-['Inter']">Logged as <br />
                                <span class="text-md text-black font-semibold">
                                    {user.value?.mail}
                                </span>
                            </div>

                            <button class="w-full block cursor-pointer my-1 text-center p-1 bg-gray-800 hover:bg-black rounded-lg text-white text-base font-medium font-['Inter'] leading-normal" onClick$={async()=>{
                                await fetch("/api/cookie",{method:"DELETE"});
                                nav("/login");
                            }}>Log out</button>
                            <a href="/dashboard" class="block cursor-pointer my-1 text-center p-1 bg-[#0094ff] hover:bg-[#0083ee] rounded-lg text-white text-base font-['Inter'] leading-normal">
                                Change client
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div id="cover" class="transition-all fixed w-full h-full top-0 left-0 hidden z-10" onClick$={toggleSidebar}>

            </div>
        </div>
    )
})