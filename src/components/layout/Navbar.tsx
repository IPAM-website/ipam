import { $, component$, useSignal } from "@builder.io/qwik";
import { NavLink } from "../NavLink/NavLink";
import { useNavigate } from "@builder.io/qwik-city";

export default component$(() => {
    const clicked = useSignal(false);
    const nav = useNavigate();

    const logout = $(async () => {
        await fetch("/api/cookie", { method: "DELETE" });
        nav("/login");
    })

    return (
        <>
            <div class="w-full h-16 bg-white border-b border-[#dfdfdf] mb-8 flex *:h-full *:items-center">
                <div class="w-1/12 flex-none"></div>
                <div class="w-9/12 flex flex-auto">
                    <span class="font-['Inter'] leading-[30px] text-black text-xl font-semibold">
                        IP Address Manager
                    </span>
                </div>
                <div class="w-2/12 flex flex-auto cursor-pointer" onClick$={() => {
                    clicked.value = !clicked.value;
                }}>
                    <img class="w-[40px] h-[40px] rounded-full" src="https://placehold.co/40x40" />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class={"ms-2 transition-all size-4 " + (clicked.value ? "rotate-z-180" : "")}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                    <div class={"absolute top-14 w-28 bg-white rounded-md overflow-hidden transition-all *:cursor-pointer border-gray-300 " + (clicked.value ? "h-[88px] border border-gray-300" : "h-[0px]")}>
                        <div class="h-[88px] pt-1 *:py-1 flex flex-col text-xs text-gray-500 *:hover:text-black p-2">
                            <NavLink href="/details" activeClass="text-black">Dettagli</NavLink>
                            <NavLink href="/settings" activeClass="text-black">Impostazioni</NavLink>
                            <button onClick$={logout} class="text-white hover:bg-white hover:border transition-all cursor-pointer bg-gray-900 rounded-lg p-1 mt-1">Logout</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})