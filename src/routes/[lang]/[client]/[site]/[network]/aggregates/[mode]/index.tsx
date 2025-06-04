/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type {
  Signal
} from "@builder.io/qwik";
import {
  $,
  component$,
  Slot,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type { RequestEventAction } from "@builder.io/qwik-city";
import {
  routeAction$,
  routeLoader$,
  server$,
  useLocation,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { sqlForQwik } from '~/../db';
import TextboxForm from "~/components/form/formComponents/TextboxForm";
import type { ReteModel, AggregatoModel } from "~/dbModels";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import { inlineTranslate } from "qwik-speak";
import { getLocale } from "@builder.io/qwik";
import ButtonAddLink from "~/components/table/ButtonAddLink";
import { getUser, isUserClient } from "~/fnUtils";

type CustomRow = AggregatoModel & { idretec: number; ipretec?: string };

export const useSiteName = routeLoader$(async ({ params, env }) => {
  const sql = sqlForQwik(env);
  if (isNaN(parseInt(params.site)))
    return;
  return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0]
    .nomesito;
});

export const useAction = routeAction$(
  async (data, { env }: RequestEventAction) => {
    const sql = sqlForQwik(env);
    let success = false;
    let type_message = 0;
    try {
      await sql`UPDATE aggregati SET nomeaggregato=${data.nomeaggregato},descrizioneaggregato = ${data.descrizioneaggregato} WHERE ip=${data.idaggregato}`;
      type_message = 2;

      success = true;
    } catch (e) {
      type_message = 4;
    }

    return {
      success,
      type_message,
    };
  },
  zod$({
    idaggregato: z.number(),
    nomeaggregato: z.string(),
    idrete: z.number(),
    idretec: z.array(z.number()).optional().nullable(),
    descrizioneaggregato: z.string(),
    mode: z.string(),
  }),
);

export const getAllNetworksBySite = server$(async function () {
  const sql = sqlForQwik(this.env);
  let networks: ReteModel[] = [];
  const pathParts = new URL(this.request.url).pathname.split('/');
  const idsito = parseInt(pathParts[3]);
  try {
    if (isNaN(idsito))
      return [];
    const query =
      await sql`SELECT rete.* FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete 
                                WHERE siti_rete.idsito=${idsito}`;
    networks = query as unknown as ReteModel[];
  } catch (e) {
    console.log(e);
  }

  return networks;
});

export const getAllAggregatesByNetwork = server$(async function (
  idsito: number,
) {

  function nextNetwork(ip: string, prefix: number) {
    const networkWidth: number = Math.pow(2, 32 - prefix);
    const parsedIP: number[] = ip.split(".").map((x) => parseInt(x));
    parsedIP[3] += networkWidth;
    for (let i = 2; i >= 0; i--) {
      if (parsedIP[i + 1] > 255) {
        parsedIP[i] += Math.trunc(parsedIP[i + 1] / 256);
        parsedIP[i + 1] = parsedIP[i + 1] % 256;
      } else break;
    }

    return parsedIP.join(".");
  }

  try {
    if (isNaN(idsito))
      return [];
    const networks = await getAllNetworksBySite();
    const prefixes: number[] = [];

    networks.forEach((x) => {
      if (!prefixes.includes(x.prefissorete)) {
        prefixes.push(x.prefissorete);
      }
    });

    prefixes.sort((a, b) => (a > b ? 1 : 0));



    const test: any[] = [];

    prefixes.forEach((x) => {
      const flt = networks.filter((j) => j.prefissorete == x);
      flt.sort((a, b) => {
        if (a.iprete > b.iprete) return 1;
        if (a.iprete < b.iprete) return -1;
        return 0;
      });

      if (flt.length > 1) {
        for (let i = 0; i < flt.length - 1; i++) {
          let space = 1;
          let baseIP = "";
          while (
            i < flt.length - 1 &&
            nextNetwork(flt[i].iprete, x) == flt[i + 1].iprete
          ) {
            if (baseIP == "") baseIP = flt[i].iprete;
            space++;
            i++;
          }
          if (space > 1) {
            test.push({
              iprete: baseIP,
              prefisso: x - Math.trunc(Math.sqrt(space)),
            });
            //console.log(`Aggregato creato da ${baseIP} con prefisso ${x}`);
          }
        }
      } else if (flt.length === 1) {
        // opzionale: crea aggregato anche per reti singole
        test.push({
          iprete: flt[0].iprete,
          prefisso: flt[0].prefissorete,
        });
        //console.log(`Aggregato singolo creato per ${flt[0].iprete}`);
      }
    });


    return test;
  } catch (e) {
    console.log(e);
    return [];
  }
});

export const deleteIP = server$(async function (this, data) {
  const sql = sqlForQwik(this.env);
  try {
    await sql`DELETE FROM indirizzi WHERE ip=${data.address}`;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
});

// type Notification = {
//   message: string;
//   type: "success" | "error";
// };

interface FilterObject {
  value?: string;
}

export const search = server$(async function (this, filter: FilterObject) {
  const sql = sqlForQwik(this.env);
  if (filter.value) {
    const queryResult = await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site} AND indirizzi.nome_dispositivo LIKE ${filter.value}`;
    return queryResult as unknown as AggregatoModel[];
  }
  return [];
});

export default component$(() => {
  // const notify = useNotify();
  const isClient = useSignal<boolean>(false);
  const lang = getLocale("en");
  const updateNotification = useSignal(false);
  const filter = useSignal<FilterObject>({ value: '' });
  //const txtQuickSearch = useSignal<HTMLInputElement | undefined>(undefined);
  const networks = useSignal<ReteModel[]>([]);
  const aggregates = useSignal<CustomRow[]>([]);
  const aggregate = useSignal<AggregatoModel>();
  const loc = useLocation();
  // const nav = useNavigate();
  // const filter = useStore<FilterObject>({ active: false, visible: false, params: { network: '', query: '' } });
  const mode = loc.params.mode ?? "view";
  // const txtQuickSearch = useSignal<HTMLInputElement>();
  const reloadFN = useSignal<(() => void) | null>(null);
  // const notifications = useSignal<Notification[]>([]);
  const user = useSignal<{ id: number; mail: string, admin: boolean }>();

  useVisibleTask$(() => {
    const eventSource = new EventSource(`http://${window.location.hostname}:3010/events`);
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        //console.log(data)
        // Se il clientId dell'evento è diverso dal mio, mostra la notifica
        if (isClient.value) {
          reloadFN.value?.()
        }
        else {
          if (data.table == "aggregati") {
            if (data.clientId !== user.value?.id) {
              updateNotification.value = true;
            }
          }
        }
      } catch (e) {
        console.error('Errore parsing SSE:', event?.data);
      }
    };
    return () => eventSource.close();
  });

  useTask$(async () => {
    user.value = await getUser();
    isClient.value = await isUserClient();
    networks.value = await getAllNetworksBySite();

    // if (loc.url.searchParams.has("network")) {
    // }

    aggregates.value = await getAllAggregatesByNetwork(
      parseInt(loc.params.site),
    );

    // for (const [key, value] of loc.url.searchParams.entries()) {
    //     filter.params[key] = value;
    //     filter.active = true;
    // }
  });

  // const addNotification = $((message: string, type: "success" | "error") => {
  //   notifications.value = [...notifications.value, { message, type }];
  //   // Rimuovi la notifica dopo 3 secondi
  //   setTimeout(() => {
  //     notifications.value = notifications.value.filter(
  //       (n) => n.message !== message,
  //     );
  //   }, 3000);
  // });

  // const handleError = $((error: any) => {
  //   console.log(error);
  //   addNotification(
  //     lang === "en" ? "Error during import" : "Errore durante l'importazione",
  //     "error",
  //   );
  // });

  // const handleOkay = $(() => {
  //   // console.log("ok");
  //   addNotification(
  //     lang === "en"
  //       ? "Import completed successfully"
  //       : "Importazione completata con successo",
  //     "success",
  //   );
  // });

  // const handleModify = $((row: any) => {
  //   Object.assign(aggregate, row as CustomRow);
  //   nav(loc.url.href.replace("view", "update"));
  // });

  // const handleDelete = $(async (row: any) => {
  //   if (await deleteIP({ address: row.ip }))
  //     addNotification(
  //       lang === "en" ? "Deleted successfully" : "Eliminato con successo",
  //       "success",
  //     );
  //   else
  //     addNotification(
  //       lang === "en"
  //         ? "Error during deletion"
  //         : "Errore durante l'eliminazione",
  //       "error",
  //     );
  // });

  // const reloadData = $(async () => {
  //     if (filter.active)
  //         return await useAddresses(filter.params);
  //     else
  //         return await useAddresses();
  // })

  const getREF = $((reloadFunc: () => void) => {
    reloadFN.value = reloadFunc;
  });

  const reloadData = $(async () => {
    if (filter.value.value != "") return await search(filter.value);
    else return await getAllAggregatesByNetwork(parseInt(loc.params.site));
  });

  const ddw = $(() => false);
  const mmw = $(() => false);

  const t = inlineTranslate();

  return (
    <>
      {updateNotification.value && (
        <div
          class={[
            "fixed left-1/2 top-8 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg border-2 transition-all duration-300",
            "bg-cyan-100 border-cyan-300 text-cyan-900",
            "dark:bg-cyan-950 dark:border-cyan-700 dark:text-cyan-100",
            "transform -translate-x-1/2"
          ]}
          style={{
            filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.12))",
            opacity: 0.98,
          }}
        >
          <svg class="h-6 w-6 text-cyan-500 dark:text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
          </svg>
          <span class="font-semibold">
            {lang === "en"
              ? "The aggregates table has been updated. Click the 'Reload' button to refresh the table."
              : "La tabella degli aggregati è stata aggiornata. Clicca il pulsante 'Ricarica' per aggiornare la tabella."}
          </span>
        </div>
      )}
      {/* <Title haveReturn={true} url={mode == "view" ? loc.url.pathname.split("addresses")[0] : loc.url.pathname.replace(mode, "view")} > {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} Aggregate</Title> */}
      {mode == "view" ? (

        <div>


          <Table>
            <div class="mb-4 flex flex-col gap-2 rounded-t-xl border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 px-4 py-6 md:flex-row md:items-center md:justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-800 dark:text-gray-50">{t("network.aggregates.aggregatelist")}</span>
              </div>

            </div>
            <div class="flex flex-row items-center collapse gap-2 mb-4 [&>*]:my-0 [&>*]:py-0">
              <ButtonAddLink
                nomePulsante=""
                href=""
              ></ButtonAddLink>
              <div>

              </div>
            </div>
            <Dati
              DBTabella="aggregati"
              title={t("network.aggregates.aggregatelist")}
              dati={aggregates.value}
              nomeTabella={"aggregati"}
              deleteWhen={ddw}
              modifyWhen={mmw}
              onReloadRef={getREF}
              funcReloadData={reloadData}
            >
            </Dati>
          </Table>
        </div>
      ) : (
        <CRUDForm data={aggregate.value} reloadFN={reloadFN} />
      )}
    </>
  );
});

export const FormBox = component$(({ title }: { title?: string }) => {
  return (
    <>
      <div class="rounded-lg border border-gray-300">
        {title && (
          <div class="w-full border-b-1 border-gray-200 p-2">
            <h1>{title}</h1>
          </div>
        )}
        <div class="w-full p-4 *:flex *:w-full **:flex-1">
          <Slot></Slot>
        </div>
      </div>
    </>
  );
});

export const CRUDForm = component$(
  ({
    data
  }: {
    data?: AggregatoModel;
    reloadFN?: Signal<(() => void) | null>;
  }) => {
    const loc = useLocation();
    const action = useAction();

    const formData = useStore<AggregatoModel & { idretec: number[] }>({
      idaggregato: 0,
      idrete: 0,
      nomeaggregato: "",
      descrizioneaggregato: "",
      idretec: [],
    });

    const networks = useSignal<ReteModel[]>([]);

    useTask$(async () => {
      networks.value = await getAllNetworksBySite();

      if (loc.params.mode == "update") {
        Object.assign(formData, data);
      }
    });

    const t = inlineTranslate();

    return (
      <>
        <div class="relative m-2 flex justify-center gap-4 *:w-1/2 max-sm:*:my-2">
          <FormBox title="Informazioni">
            <TextboxForm
              id=""
              placeholder={t("network.aggregates.name")}
              title={t("network.aggregates.name")}
              onInput$={(e) => {
                formData.nomeaggregato = (e.target as HTMLOptionElement).value;
              }}
            />
            <TextboxForm
              id=""
              placeholder={t("network.aggregates.description")}
              title={t("network.aggregates.description")}
              onInput$={(e) => {
                formData.descrizioneaggregato = (
                  e.target as HTMLOptionElement
                ).value;
              }}
            />
          </FormBox>
          {/* <FormBox title="Dettagli">

                    
                </FormBox> */}
        </div>
        <div class="flex justify-center">
          <button
            onClick$={async (e) => {
              e.preventDefault();

              await action.submit({ ...formData, mode: loc.params.mode });
              if (action.value && action.value.success) {
                await new Promise((resolve) => {
                  setTimeout(resolve, 2000);
                });
                window.location.href = loc.url.href
                  .replace("insert", "view")
                  .replace("update", "view");
              }
            }}
            class="mx-1 ms-4 rounded-md bg-green-500 p-2 text-white transition-all hover:bg-green-600 disabled:bg-green-300"
          >{t("confirm")}</button>
          <a
            class="mx-1 inline-block rounded-md bg-red-500 p-2 text-white transition-all hover:bg-red-600"
            href={loc.url.href
              .replace("insert", "view")
              .replace("update", "view")}
          >{t("cancel")}</a>
          {action.submitted && action.value && (
            <div
              class={
                action.value.success
                  ? "mt-2 rounded-md bg-green-400 p-2 text-white"
                  : "mt-2 rounded-md bg-red-400 p-2 text-white"
              }
            >
              {/* {action.value.type_message == 1 && (
                <span>{$localize`Inserimento avvenuto correttamente`}</span>
              )}
              {action.value.type_message == 2 && (
                <span>{$localize`Modifica avvenuta correttamente`}</span>
              )}
              {action.value.type_message == 3 && (
                <span>{$localize`Errore durante l'inserimento`}</span>
              )}
              {action.value.type_message == 4 && (
                <span>{$localize`Errore durante la modifica`}</span>
              )} */}
              <span>{t(`action.result${action.value.type_message}`)}</span>
            </div>
          )}
        </div>
      </>
    );
  },
);
