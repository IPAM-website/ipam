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
} from "@builder.io/qwik";
import {
  routeAction$,
  routeLoader$,
  server$,
  useLocation,
  z,
  zod$,
} from "@builder.io/qwik-city";
import sql from "~/../db";
import TextboxForm from "~/components/form/formComponents/TextboxForm";
import type { ReteModel, AggregatoModel } from "~/dbModels";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import { inlineTranslate } from "qwik-speak";

type CustomRow = AggregatoModel & { idretec: number; ipretec?: string };

export const useSiteName = routeLoader$(async ({ params }) => {
  if (isNaN(parseInt(params.site)))
    return;
  return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0]
    .nomesito;
});

export const useAction = routeAction$(
  async (data) => {
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

export const getAllNetworksBySite = server$(async function (idsito: number) {
  let networks: ReteModel[] = [];
  try {
    if (isNaN(idsito))
      throw new Error("idsito non disponibile")
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
      throw new Error("idsito non disponibile")
    const networks = await getAllNetworksBySite(idsito);
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
        return 0;
      });

      // console.log("network filtrate",networks);
      if (flt.length > 1)
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
          }
        }
    });

    return test;
  } catch (e) {
    console.log(e);
    return [];
  }
});

export const deleteIP = server$(async function (this, data) {
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

export default component$(() => {
  // const notify = useNotify();
  // const lang = getLocale("en");
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

  useTask$(async () => {
    networks.value = await getAllNetworksBySite(parseInt(loc.params.site));

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

  const ddw = $(() => false);
  const mmw = $(() => false);

  const t = inlineTranslate();

  return (
    <>
      {/* <Title haveReturn={true} url={mode == "view" ? loc.url.pathname.split("addresses")[0] : loc.url.pathname.replace(mode, "view")} > {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} Aggregate</Title> */}
      {mode == "view" ? (
        <div>
          {/* <PopupModal title="Filters" visible={filter.visible} onClosing$={() => filter.visible = false}>
                                <div class="flex">
                                    <div class="w-full">
                                        <span class="ms-2">Network</span>
                                        <SelectForm OnClick$={(e) => { filter.params.network = (e.target as HTMLOptionElement).value }} id="filter-network" name="" value={filter.params.network} listName="Reti">
                                            {networks.value.map((x: ReteModel) => <option value={x.idrete}>{x.nomerete}</option>)}
                                        </SelectForm>
                                    </div>
                                </div>
                                <div class="flex w-full mt-2">
                                    <div class="flex-auto"></div>
                                    <button class=" flex gap-1 items-center p-2 px-4 border-gray-300 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-500 border cursor-pointer disabled:cursor-default text-gray-900 rounded-lg mx-2" disabled={filter.params.subsite == ''} onClick$={() => {
                                        window.location.href = loc.url.pathname;
                                    }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                        Reset</button>

                                    <button class="p-2 flex items-center gap-1 px-4 bg-black hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer disabled:cursor-default text-white rounded-md" disabled={filter.params.subsite == ''} onClick$={async () => {
                                        let url = loc.url.pathname + "?";
                                        let searchParams = new URLSearchParams();
                                        for (let key in filter.params)
                                            if (filter.params[key] != '') {
                                                searchParams.append(key, filter.params[key])
                                                filter.active = true;
                                            }

                                        nav(url + searchParams);

                                        if (reloadFN) {
                                            reloadFN.value?.();
                                            filter.visible = false;
                                        }
                                    }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                        </svg>
                                        Search</button>

                                </div>
                            </PopupModal> */}

          <Table>
            <Dati
              DBTabella="aggregati"
              title={t("network.aggregates.aggregatelist")}
              dati={aggregates.value}
              nomeTabella={"aggregati"}
              deleteWhen={ddw}
              modifyWhen={mmw}
              onReloadRef={getREF}
            >
              {" "}
              {/* funcReloadData={reloadData} */}
              {/* <TextboxForm id="txtfilter" value={filter.params.query} ref={txtQuickSearch} placeholder={$localize`Ricerca rapida`} OnInput$={(e) => {
                                        filter.params.query = (e.target as HTMLInputElement).value;
                                        filter.active = false;
                                        for (let item in filter.params) {
                                            if (filter.params[item] && filter.params[item] != '') {
                                                filter.active = true;
                                                break;
                                            }
                                        }
                                        if (reloadFN)
                                            reloadFN.value?.();
                                    }} />
                                    <div class="has-tooltip">
                                        <button class="cursor-pointer p-1 rounded-md bg-black hover:bg-gray-700 text-white size-[32px] flex items-center justify-center" onClick$={() => filter.visible = true} >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                                            </svg>
                                        </button>
                                        <span class="tooltip">
                                            {$localize`Filters`}
                                        </span>
                                    </div>
                                    {filter.active && <div class="has-tooltip"><button class="size-[24px] bg-red-500 cursor-pointer hover:bg-red-400 text-white flex justify-center items-center rounded ms-2" onClick$={() => { filter.active = false; for (const key in filter.params) filter.params[key] = ''; nav(loc.url.pathname); if (txtQuickSearch.value) txtQuickSearch.value.value = ""; reloadFN.value?.() }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                        </svg>
                                        <span class="tooltip mb-1 ml-1.5">{$localize`Erase Filters`}</span>
                                    </button></div>} */}
            </Dati>
            {/* <ButtonAddLink nomePulsante={$localize`Aggiungi aggregato`} href={loc.url.href.replace("view", "insert")}></ButtonAddLink> */}
            {/* <ImportCSV OnError={handleError} OnOk={handleOkay} nomeImport="aggregati" /> */}
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
      networks.value = await getAllNetworksBySite(parseInt(loc.params.site));

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
