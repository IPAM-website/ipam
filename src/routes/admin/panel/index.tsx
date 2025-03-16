import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";

export default component$(() => {
    return (
        <>
            <div class="size-full px-24 lg:px-40 bg-white overflow-hidden">
                <Title haveReturn={true} url={"/dashboard"}>Admin Panel</Title>
                <div class="w-[418px] h-[194px] left-[595px] top-[295px] absolute rounded-lg outline outline-1 outline-[#cdcdcd] inline-flex justify-start items-center gap-2.5 overflow-hidden">
                    <div class="flex-1 self-stretch inline-flex flex-col justify-start items-start">
                        <div class="self-stretch h-[46px] relative border-b border-[#f3f3f3] overflow-hidden">
                            <div class="left-[19px] top-[11px] absolute justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Operazioni</div>
                        </div>
                        <a href="/admin/panel/tecnici" class="self-stretch px-[19px] py-[11px] inline-flex justify-between overflow-hidden cursor-pointer hover:bg-gray-100 transition-all duration-300">
                            <div class="flex-1 text-center justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Mostra tutti i tecnici</div>
                        </a>
                        <div class="self-stretch px-[19px] pt-4 pb-[11px] border-t border-[#dfdfdf] inline-flex justify-between items-center overflow-hidden">
                            <div class="flex-1 text-center justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Mostra tutti i clienti</div>
                        </div>
                        <div class="self-stretch px-[19px] pt-4 pb-[11px] border-t border-[#dfdfdf] inline-flex justify-between items-center overflow-hidden">
                            <div class="flex-1 text-center justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Gestisci rapporto tecnico - clienti</div>
                        </div>
                    </div>
                </div>
                <div class="w-[909px] h-[344px] p-2 left-[104px] top-[701px] absolute rounded-lg outline outline-1 outline-[#cdcdcd] inline-flex justify-start items-center gap-2.5 overflow-hidden">
                    <div class="flex-1 self-stretch relative inline-flex flex-col justify-start items-start">
                        <div class="self-stretch h-[46px] relative border-b border-[#f3f3f3] overflow-hidden">
                            <div class="left-[19px] top-[11px] absolute justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Logs</div>
                        </div>
                        <div class="self-stretch px-[19px] pt-4 pb-[11px] inline-flex justify-start items-center gap-[60px] overflow-hidden">
                            <div class="w-[100px] justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Data</div>
                            <div class="w-12 justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Ora</div>
                            <div class="flex-1 justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Descrizione</div>
                        </div>
                        <div class="self-stretch px-[19px] pt-4 pb-[11px] border-t border-[#e8e8e8] inline-flex justify-start items-center gap-[60px] overflow-hidden">
                            <div class="w-[100px] justify-start text-black text-base font-normal font-['Inter'] leading-normal">10/12/2024</div>
                            <div class="w-12 justify-start text-black text-base font-normal font-['Inter'] leading-normal">12:20</div>
                            <div class="flex-1 justify-start text-black text-base font-normal font-['Inter'] leading-normal">Aggiunta nuova associazione tra il tecnico Mario e Stellantis</div>
                        </div>
                        <div class="self-stretch px-[19px] pt-4 pb-[11px] border-t border-[#e8e8e8] inline-flex justify-start items-center gap-[60px] overflow-hidden">
                            <div class="w-[100px] justify-start text-black text-base font-normal font-['Inter'] leading-normal">10/12/2024</div>
                            <div class="w-12 justify-start text-black text-base font-normal font-['Inter'] leading-normal">12:05</div>
                            <div class="flex-1 justify-start text-black text-base font-normal font-['Inter'] leading-normal">Aggiunto nuovo tecnico “Mario”</div>
                        </div>
                        <div data-size="48" class="w-6 h-6 left-[69px] top-[11px] absolute overflow-hidden">
                            <div class="w-[18px] h-[18px] left-[3px] top-[3px] absolute outline outline-2 outline-offset-[-1px] outline-[#1e1e1e]" />
                        </div>
                    </div>
                </div>
                <div class="w-[427px] px-5 py-3 left-[100px] top-[295px] absolute rounded-lg outline outline-1 outline-[#cdcdcd] inline-flex flex-col justify-start items-start gap-1 overflow-hidden">
                    <div class="self-stretch h-[50px] relative overflow-hidden">
                        <div class="left-0 top-[10px] absolute justify-start text-black text-xl font-semibold font-['Inter'] leading-[30px]">Informazioni Varie</div>
                    </div>
                    <div class="self-stretch px-2 py-2.5 border-t border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">Numero tecnici</div>
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">12</div>
                    </div>
                    <div class="self-stretch px-2 py-2.5 border-t border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">Numero clienti</div>
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">5</div>
                    </div>
                    <div class="self-stretch px-2 py-2.5 border-t border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">Numero siti</div>
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">50</div>
                    </div>
                    <div class="self-stretch px-2 py-2.5 border-t border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">Rapporto tecnici/clienti</div>
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">2.40</div>
                    </div>
                    <div class="self-stretch px-2 py-2.5 border-t border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">Rapporto tecnici/siti</div>
                        <div class="justify-start text-black text-xl font-normal font-['Inter'] leading-[30px]">0.42</div>
                    </div>
                </div>
                
            </div>
        </>
    )
})

export const head: DocumentHead = {
    title: "Admin",
    meta: [
        {
            name: "Pagina admin principale",
            content: "Pagina admin principale dell'applicazione IPAM",
        },
    ],
};