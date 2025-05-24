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
            class="group cursor-pointer rounded-lg bg-white dark:bg-gray-800 p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.2)] outline-1 outline-offset-[-1px] outline-[#dfdfdf] dark:outline-gray-700 transition-all hover:-translate-y-1 hover:shadow-lg hover:outline-gray-300 dark:hover:outline-gray-600"
            onClick$={() => {
              nav(getBaseURL() + x.idcliente);
            }}
          >
            <div class="flex items-center gap-3">
              {/* <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div> */}
              <p class="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {x.nomecliente}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div class="max-w-[400px] min-w-[300px] cursor-pointer justify-start rounded-lg bg-white dark:bg-gray-800 p-6 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] dark:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.2)] outline-1 outline-offset-[-1px] outline-[#dfdfdf] dark:outline-gray-700 transition-all hover:-translate-y-1 hover:shadow-lg hover:outline-gray-300 dark:hover:outline-gray-600">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p class="font-semibold text-gray-900 dark:text-white">
              {t("noclients")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});
