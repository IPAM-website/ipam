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
    throw new Error("ciadi");
  }

})

export const ClientList = component$<ClientListProps>((props) => {
  const clientList = useSignal<ClientInfo[] | null>(null)
  useTask$(async () => {
    try
    {
      clientList.value = await useClients() as any;
    }
    catch{
      clientList.value = null;
    }
  })

  return (
    <div class="w-full flex flex-col lg:flex-row gap-4 mt-8">
      {clientList.value ? 
      clientList.value.map((x: ClientInfo) => {
        return (
          <div class={"cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all flex-auto p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf] flex flex-col justify-start items-start gap-4"}>
            <img src="" alt={$localize`Immagine Cliente`} />
            <p class="font-semibold">{x.nomecliente}</p>
          </div>
          
        )
      }) 
      : 
      <div class={"cursor-pointer justify-center flex-auto p-6 bg-white rounded-lg shadow-md outline-1 outline-offset-[-1px] outline-gray-300 flex items-start gap-4"}>
        <p class="font-semibold">{$localize`Non ci sono clienti`}</p>
      </div>
      }
    </div>
  );
});
