import type {
  Signal} from "@builder.io/qwik";
import {
  component$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { server$, useNavigate } from "@builder.io/qwik-city";
import sql from "~/../db";
import { getBaseURL } from "~/fnUtils";
import type { ClienteModel } from "~/dbModels";
import { inlineTranslate } from "qwik-speak";

export interface ClientListProps {
  client ?: Signal<number>,
  currentTec ?: number,
  refresh ?: number
}

export const getClients = server$(async () => {
  try {
    const query = await sql`SELECT * FROM clienti`;
    return query;
  } catch (e: any) {
    throw new Error(e);
  }
});

export default component$((props: ClientListProps) => {
  const clientList = useSignal<ClienteModel[] | null>(null);
  const nav = useNavigate();

  const t = inlineTranslate();

  useTask$(async ({track}) => {
    track(() => props.refresh);
    clientList.value = null;
    clientList.value = await getClients() as any;
  });

  return (
    <div class="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {clientList.value && clientList.value.length > 0 ? (
        clientList.value.map((x: ClienteModel) => (
          <div
            key={x.idcliente}
            class="cursor-pointer rounded-lg bg-white p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf] transition-all hover:-translate-y-1 hover:shadow-lg hover:outline-gray-300"
            onClick$={() => {
              nav(getBaseURL() + x.idcliente);
            }}
          >
            {/* <img src="" alt={$localize`Immagine Cliente`} /> */}
            <p class="font-semibold">{x.nomecliente}</p>
          </div>
        ))
      ) : (
        <div class="max-w-[400px] min-w-[300px] cursor-pointer justify-start rounded-lg bg-white p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf] transition-all hover:-translate-y-1 hover:shadow-lg hover:outline-gray-300">
          <p class="font-semibold">{t("noclients")}</p>
        </div>
      )}
    </div>
  );
});
