import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import ClientInfo from './clientinfo';
import { server$ } from '@builder.io/qwik-city';
import sql from "~/../db";
export interface ClientListProps {

}

export const useClients = server$(async () => {
  try {
    const query = await sql`SELECT * FROM clienti`
    return query;
  }
  catch {
    return {
      errore: "SI"
    }
  }


})

export const ClientList = component$<ClientListProps>((props) => {
  const clientList = useSignal<ClientInfo[] | null>(null)
  useTask$(async () => {
    clientList.value = await useClients() as any;
    console.log(clientList.value);
  })

  return (
    <div class="w-full flex flex-col lg:flex-row gap-4 mt-8">
      {clientList.value ? 
      clientList.value.map((x: ClientInfo) => {
        return (
          <div class={"cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all flex-auto p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf] flex flex-col justify-start items-start gap-4"}>
            <img src="" alt="Immagine Cliente" />
            <p class="font-semibold">{x.nomecliente}</p>
          </div>
          
        )
      }) 
      : 
      <p>Non ci sono clienti.</p>
      }
      {/* <div class="w-[363px] h-[272px] p-6 left-[75px] top-[202px] absolute bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-[#dfdfdf] inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
                <img class="w-[311px] h-[162px] rounded-[40px] border border-black/20" src="https://placehold.co/311x162" />
                <div class="self-stretch text-center justify-start text-black text-[40px] font-semibold font-['Inter'] leading-[44px]">Stellantis</div>
            </div>
            <div class="w-[363px] h-[272px] p-6 left-[536px] top-[202px] absolute bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-[#dfdfdf] inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div class="w-[314px] h-[161px] relative overflow-hidden">
                    <img class="w-[154px] h-[154px] left-[85px] top-[7px] absolute" src="https://placehold.co/154x154" />
                </div>
                <div class="self-stretch text-center justify-start text-black text-[40px] font-semibold font-['Inter'] leading-[44px]">Iveco</div>
            </div>
            <div class="w-[363px] h-[272px] p-6 left-[997px] top-[202px] absolute bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-[#dfdfdf] inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div class="w-[314px] h-[161px] relative overflow-hidden">
                    <img class="w-40 h-40 left-[80px] top-[10px] absolute" src="https://placehold.co/160x160" />
                </div>
                <div class="self-stretch text-center justify-start text-black text-[40px] font-semibold font-['Inter'] leading-[44px]">CNH</div>
            </div> */}
    </div>
  );
});
