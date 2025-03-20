import { $, component$, useSignal } from "@builder.io/qwik";
import { NavLink } from "../NavLink/NavLink";
import { server$, useNavigate } from "@builder.io/qwik-city";
import { toggleSidebar } from "./Sidebar";


export default component$(() => {
    const clicked = useSignal(false);
    const nav = useNavigate();

    const logout = $(async () => {
        await fetch("/api/cookie", { method: "DELETE" });
        nav("/login");
    })

    return (
        <>
            <div class="flex bg-white border-[#dfdfdf] border-b h-16 w-full *:h-full *:items-center mb-8">
                <div class="flex flex-none justify-end w-1/12 items-center pe-2">
                    <button class="cursor-pointer" onClick$={toggleSidebar}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
                <div class="flex flex-auto w-9/12">
                    <span class="font-['Inter'] leading-[30px] text-black text-xl font-semibold">
                        IP Address Manager
                    </span>
                </div>
                <div class="flex flex-auto w-2/12 cursor-pointer" onClick$={() => {
                    clicked.value = !clicked.value;
                }}>
                    <img class="h-[40px] rounded-full w-[40px]" src="https://placehold.co/40x40" />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={"ms-2 transition-all size-4 " + (clicked.value ? "rotate-z-180" : "")}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                    <div class={"absolute top-14 w-28 bg-white rounded-md overflow-hidden transition-all *:cursor-pointer border-gray-300 " + (clicked.value ? "h-[88px] border border-gray-300" : "h-[0px]")}>
                        <div class="flex flex-col h-[88px] p-2 text-gray-500 text-xs *:hover:text-black *:py-1 pt-1">
                            <NavLink href="/details" activeClass="text-black">Dettagli</NavLink>
                            <NavLink href="/settings" activeClass="text-black">Impostazioni</NavLink>
                            <button onClick$={logout} class="bg-gray-900 p-1 rounded-lg text-white cursor-pointer hover:bg-white hover:border mt-1 transition-all">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})