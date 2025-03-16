import { component$ } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Headers from "~/components/table/Headers";

export default component$(() => {
    return (
        <>
            <div class="size-full px-24 lg:px-40 bg-white overflow-hidden">
                            <Title haveReturn={true} url={"/admin/panel"}>Admin Panel</Title>
                            <div class="w-[1271px] h-72 relative bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 overflow-hidden">
  <div class="w-[1211px] h-12 left-[25px] top-[88px] absolute border-t border-neutral-200">
    <div class="w-28 left-0 top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">Marco</div>
    <div class="w-60 left-[144px] top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">5</div>
    <div class="w-96 left-[551px] top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">---</div>
    <div class="w-6 h-6 left-[1158px] top-[12px] absolute">
      <div class="w-6 h-6 left-0 top-0 absolute bg-yellow-500 rounded"></div>
      <div class="w-6 h-6 left-0 top-0 absolute overflow-hidden">
        <div class="w-6 h-6 left-0 top-0 absolute"></div>
        <div class="w-4 h-4 left-[3px] top-[3px] absolute bg-white"></div>
      </div>
    </div>
    <div class="left-[384px] top-[15px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">Firewall</div>
  </div>
  <div class="w-6 h-6 left-[1215px] top-[100px] absolute">
    <div class="w-6 h-6 left-0 top-0 absolute bg-red-700 rounded"></div>
    <div class="w-6 h-6 left-0 top-0 absolute overflow-hidden">
      <div class="w-6 h-6 left-0 top-0 absolute"></div>
      <div class="w-3.5 h-4 left-[5px] top-[3px] absolute bg-white"></div>
    </div>
  </div>
  <div class="w-[1211px] h-12 left-[25px] top-[136px] absolute border-t border-neutral-200">
    <div class="w-28 left-0 top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">Gianni</div>
    <div class="w-60 left-[144px] top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">2</div>
    <div class="w-96 left-[553px] top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">---</div>
    <div class="w-36 left-[384px] top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">Server</div>
    <div class="w-6 h-6 left-[1157px] top-[12px] absolute">
      <div class="w-6 h-6 left-0 top-0 absolute bg-yellow-500 rounded"></div>
      <div class="w-6 h-6 left-0 top-0 absolute overflow-hidden">
        <div class="w-6 h-6 left-0 top-0 absolute"></div>
        <div class="w-4 h-4 left-[3px] top-[3px] absolute bg-white"></div>
      </div>
    </div>
    <div class="w-6 h-6 left-[1190px] top-[12px] absolute">
      <div class="w-6 h-6 left-0 top-0 absolute bg-red-700 rounded"></div>
      <div class="w-6 h-6 left-0 top-0 absolute overflow-hidden">
        <div class="w-6 h-6 left-0 top-0 absolute"></div>
        <div class="w-3.5 h-4 left-[5px] top-[3px] absolute bg-white"></div>
      </div>
    </div>
  </div>
  <div class="w-[1211px] h-12 left-[25px] top-[184px] absolute border-t border-neutral-200">
    <div class="w-28 left-0 top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">Francesco</div>
    <div class="w-60 left-[144px] top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">3</div>
    <div class="w-96 left-[552px] top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">---</div>
    <div class="w-36 left-[384px] top-[12px] absolute justify-start text-black text-base font-medium font-['Inter'] leading-normal">DNS</div>
    <div class="w-6 h-6 left-[1158px] top-[12px] absolute">
      <div class="w-6 h-6 left-0 top-0 absolute bg-yellow-500 rounded"></div>
      <div class="w-6 h-6 left-0 top-0 absolute overflow-hidden">
        <div class="w-6 h-6 left-0 top-0 absolute"></div>
        <div class="w-4 h-4 left-[3px] top-[3px] absolute bg-white"></div>
      </div>
    </div>
    <div class="w-6 h-6 left-[1190px] top-[12px] absolute">
      <div class="w-6 h-6 left-0 top-0 absolute bg-red-700 rounded"></div>
      <div class="w-6 h-6 left-0 top-0 absolute overflow-hidden">
        <div class="w-6 h-6 left-0 top-0 absolute"></div>
        <div class="w-3.5 h-4 left-[5px] top-[3px] absolute bg-white"></div>
      </div>
    </div>
  </div>
  <div class="w-36 left-[24px] top-[64px] absolute justify-start text-zinc-500 text-base font-semibold font-['Inter'] leading-normal">Nome</div>
  <div class="w-60 left-[171px] top-[64px] absolute justify-start text-zinc-500 text-base font-semibold font-['Inter'] leading-normal">N. Clienti</div>
  <div class="w-96 left-[576px] top-[64px] absolute justify-start text-zinc-500 text-base font-semibold font-['Inter'] leading-normal">Descrizione</div>
  <Headers nomeHeader={"Lista tecnici"}></Headers>
  <div class="w-36 left-[412px] top-[68px] absolute justify-start text-zinc-500 text-base font-semibold font-['Inter'] leading-normal">Ruolo</div>
  <div class="w-96 h-9 px-4 left-[24px] top-[232px] absolute bg-black rounded-lg inline-flex justify-center items-center gap-2">
    <div data-size="48" class="w-5 h-5 relative overflow-hidden">
      <div class="w-3 h-3 left-[4.17px] top-[4.17px] absolute outline outline-2 outline-offset-[-1px] outline-Grays-White"></div>
    </div>
    <div class="justify-center text-white text-base font-medium font-['Inter'] leading-normal">Aggiungi tecnico</div>
  </div>
</div>
                        </div>
        </>
    )
})

export const head: DocumentHead = {
    title: "Gesione tecnici",
    meta: [
        {
            name: "Gestione tecnici",
            content: "Pagina dell'admin per la gestione dei tecnici",
        },
    ],
};