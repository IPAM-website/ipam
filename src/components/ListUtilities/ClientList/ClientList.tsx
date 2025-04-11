import { component$, getLocale, Signal, useContext, useSignal, useTask$ } from '@builder.io/qwik';
import ClientInfo from './clientinfo';
import { server$, useNavigate } from '@builder.io/qwik-city';
import sql from "~/../db";
import { setClientName } from '../../layout/Sidebar';
import { getBaseURL } from '~/fnUtils';

export interface ClientListProps {
  client : Signal<number>,
  currentTec : number
}

export const useClients = server$(async (idTecnico) => {
  try {
    //const query = await sql`SELECT clienti.* FROM clienti INNER JOIN cliente_tecnico ON cliente_tecnico.idcliente = clienti.idcliente AND cliente_tecnico.idtecnico = ${idTecnico}`
    //return query;
  }
  catch(e:any) {
    throw new Error(e);
  }

})

export default component$(({currentTec} : {currentTec:number}) => {
  const clientList = useSignal<ClientInfo[] | null>(null);
  const nav = useNavigate();

  useTask$(async () => {
    clientList.value = await useClients(currentTec) as any;
  });

  return (
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
      {clientList.value && clientList.value.length > 0 ?
        clientList.value.map((x: ClientInfo) => (
          <div
            key={x.idcliente}
            class="cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf]"
            onClick$={()=>{
              nav(getBaseURL()+x.idcliente);
            }}
          >
            <img src="" alt={$localize`Immagine Cliente`} />
            <p class="font-semibold">{x.nomecliente}</p>  
          </div>
        ))
        :

        <div
          class="cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf] min-w-[300px] max-w-[400px] justify-start"
        >
          <p class="font-semibold">{$localize`Non ci sono clienti`}</p>
        </div>
      }
    </div>
  );
});
