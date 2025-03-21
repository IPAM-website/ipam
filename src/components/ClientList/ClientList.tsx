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
    throw new Error("Error connecting to the DB");
  }

})

export const ClientList = component$<ClientListProps>((props) => {
  const clientList = useSignal<ClientInfo[] | null>(null);

  useTask$(async () => {
    clientList.value = await useClients() as any;
  });

  return (
    <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
      {clientList.value && clientList.value.length > 0 ?
        clientList.value.map((x: ClientInfo) => (
          <div
            key={x.idcliente}
            class="cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf]"
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
