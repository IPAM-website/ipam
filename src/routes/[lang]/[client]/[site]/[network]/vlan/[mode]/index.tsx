/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type {
  Signal} from "@builder.io/qwik";
import {
  $,
  component$,
  getLocale,
  Slot,
  useSignal,
  useStore,
  useTask$,
} from "@builder.io/qwik";
import type {
  RequestHandler} from "@builder.io/qwik-city";
import {
  routeAction$,
  routeLoader$,
  server$,
  useLocation,
  useNavigate,
  z,
  zod$,
} from "@builder.io/qwik-city";
import sql from "~/../db";
import SelectForm from "~/components/form/formComponents/SelectForm";
import TextboxForm from "~/components/form/formComponents/TextboxForm";
import type { ReteModel, VLANModel} from "~/dbModels";
import ButtonAddLink from "~/components/table/ButtonAddLink";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
//import ImportCSV from "~/components/table/ImportCSV";
import PopupModal from "~/components/ui/PopupModal";
import { inlineTranslate } from "qwik-speak";
// import { useNotify } from "~/services/notifications";

export const onRequest: RequestHandler = ({ params, redirect, url }) => {
  if (!["view", "insert", "update"].includes(params.mode)) {
    const splitURL = url.href.split("/");
    splitURL.pop();
    splitURL.pop();
    throw redirect(301, splitURL.join("/") + "/view");
  }
};

export interface RowAddress {
  descrizione?: string;
  idrete?: number;
  idsito?: number;
  idsottosito?: number;
  vid?: number;
  ip?: string;
  n_prefisso?: number;
  nomerete?: string;
  nomesottosito?: string;
  nome_dispositivo?: string;
  brand_dispositivo?: string;
  data_inserimento?: string;
  tipo_dispositivo?: string;
}

export interface FilterObject {
  active: boolean;
  visible: boolean;
  params: {
    [key: string]: string;
  };
}

export const getVLANs = server$(async function (this, filter = { empty: 1 }) {
  filter.query = filter.query ? filter.query + "%" : (filter.query = "%");
  filter.query = (filter.query as string).trim();
  let vlans: VLANModel[] = [];

  if (filter.empty == 1) {
    const queryResult = await sql`SELECT * FROM vlan`;
    vlans = queryResult as unknown as VLANModel[];
    return vlans;
  }

  // if (this.query.has("network") || (filter.network != undefined && filter.network != '')) {

  //     if (isNaN(parseInt(filter.query))) {
  //         const queryResult = await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.query.get("network") ?? filter.network} WHERE indirizzi.nome_dispositivo LIKE ${filter.query}`;
  //         addresses = queryResult as unknown as IndirizziModel[];
  //     }
  //     else {
  //         const queryResult = await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.query.get("network") ?? filter.network} WHERE indirizzi.ip LIKE ${filter.query}`;
  //         addresses = queryResult as unknown as IndirizziModel[];
  //     }

  // }
  // else {

  //     if (isNaN(parseInt(filter.query))) {
  //         const queryResult = await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site} AND indirizzi.nome_dispositivo LIKE ${filter.query}`;
  //         addresses = queryResult as unknown as IndirizziModel[];
  //     }
  //     else {
  //         const queryResult = await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site} AND indirizzi.ip LIKE ${filter.query}`;
  //         addresses = queryResult as unknown as IndirizziModel[];
  //     }
  // }

  return vlans;
});

export const useSiteName = routeLoader$(async ({ params }) => {
  if(isNaN(parseInt(params.site)))
    return;
  return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0]
    .nomesito;
});

export const useAction = routeAction$(
  async (data, ev) => {
    let success = false;
    let type_message = 0;
    try {
      if (ev.params.mode == "update") {
        await sql`UPDATE vlan SET vid=${data.vid}, nomevlan=${data.nomevlan}, descrizionevlan=${data.descrizionevlan} WHERE vid=${data.vid}`;
        type_message = 2;
      } else {
        await sql`INSERT INTO vlan(vid,nomevlan,descrizionevlan) VALUES (${data.vid},${data.nomevlan},${data.descrizionevlan})`;
        type_message = 1;
      }
      success = true;
    } catch (e) {
      if (ev.params.mode == "update") type_message = 4;
      else type_message = 3;
    }

    return {
      success,
      type_message,
    };
  },
  zod$({
    vid: z.number(),
    descrizionevlan: z.string(),
    nomevlan: z.string(),
  }),
);

export const getAllVLAN = server$(async function () {
  let vlans: VLANModel[] = [];
  try {
    const query = await sql`SELECT * FROM vlan`;
    vlans = query as unknown as VLANModel[];
  } catch (e) {
    console.log(e);
  }

  return vlans;
});

export const getAllNetworksBySite = server$(async function (idsito: number) {
  let networks: ReteModel[] = [];
  try {
    if(isNaN(idsito))
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

export const deleteVLAN = server$(async function (this, data) {
  try {
    if(isNaN(data.vid))
      throw new Error("vid non disponibile")
    await sql`DELETE FROM vlan WHERE vid=${data.vid}`;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
});

type Notification = {
  message: string;
  type: "success" | "error";
};

export default component$(() => {
  // const notify = useNotify();
  const lang = getLocale("en");
  const vlanList = useSignal<VLANModel[]>([]);
  const networks = useSignal<ReteModel[]>([]);
  const loc = useLocation();
  const nav = useNavigate();
  const vlan = useStore<VLANModel>({
    descrizionevlan: "",
    nomevlan: "",
    vid: 0,
  });
  const filter = useStore<FilterObject>({
    active: false,
    visible: false,
    params: { network: "", query: "" },
  });
  const mode = loc.params.mode ?? "view";
  const txtQuickSearch = useSignal<HTMLInputElement>();
  const reloadFN = useSignal<(() => void) | null>(null);
  const notifications = useSignal<Notification[]>([]);

  useTask$(async () => {
    vlanList.value = await getVLANs();
    networks.value = await getAllNetworksBySite(parseInt(loc.params.site));

    for (const [key, value] of loc.url.searchParams.entries()) {
      filter.params[key] = value;
      filter.active = true;
    }
  });

  const addNotification = $((message: string, type: "success" | "error") => {
    notifications.value = [...notifications.value, { message, type }];
    // Rimuovi la notifica dopo 3 secondi
    setTimeout(() => {
      notifications.value = notifications.value.filter(
        (n) => n.message !== message,
      );
    }, 3000);
  });

  /*const handleError = $((error: any) => {
    console.log(error);
    addNotification(
      lang === "en" ? "Error during import" : "Errore durante l'importazione",
      "error",
    );
  });

  const handleOkay = $(() => {
    // console.log("ok");
    addNotification(
      lang === "en"
        ? "Import completed successfully"
        : "Importazione completata con successo",
      "success",
    );
  });*/

  const handleModify = $((row: any) => {
    Object.assign(vlan, row as RowAddress);
    nav(loc.url.href.replace("view", "update"));
  });

  const handleDelete = $(async (row: any) => {
    if (await deleteVLAN({ vid: row.vid }))
      addNotification(
        lang === "en" ? "Deleted successfully" : "Eliminato con successo",
        "success",
      );
    else
      addNotification(
        lang === "en"
          ? "Error during deletion"
          : "Errore durante l'eliminazione",
        "error",
      );
  });

  const reloadData = $(async () => {
    // if (filter.active)
    //     return await useAddresses(filter.params);
    // else
    return await getVLANs();
  });

  const getREF = $((reloadFunc: () => void) => {
    reloadFN.value = reloadFunc;
  });

  const t = inlineTranslate();

  return (
    <>
      {/* <Title haveReturn={true} url={mode == "view" ? loc.url.pathname.split("vlan")[0] : loc.url.pathname.replace(mode, "view")} > {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} IP</Title> */}
      {mode == "view" ? (
        <div>
          <div class="fixed top-4 right-4 z-50 space-y-2">
            {notifications.value.map((notification, index) => (
              <div
                key={index}
                class={`rounded-md p-4 shadow-lg ${notification.type === "success"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                  }`}
              >
                {notification.message}
              </div>
            ))}
          </div>
          <PopupModal
            title="Filters"
            visible={filter.visible}
            onClosing$={() => (filter.visible = false)}
          >
            <div class="flex">
              <div class="w-full">
                <span class="ms-2">Network</span>
                <SelectForm
                  OnClick$={(e) => {
                    filter.params.network = (
                      e.target as HTMLOptionElement
                    ).value;
                  }}
                  id="filter-network"
                  name=""
                  value={filter.params.network}
                  listName="Reti"
                >
                  {networks.value.map((x: ReteModel) => (
                    <option value={x.idrete} key={x.idrete}>{x.nomerete}</option>
                  ))}
                </SelectForm>
              </div>
            </div>
            <div class="mt-2 flex w-full">
              <div class="flex-auto"></div>
              <button
                class="mx-2 flex cursor-pointer items-center gap-1 rounded-lg border border-gray-300 p-2 px-4 text-gray-900 hover:bg-gray-100 disabled:cursor-default disabled:bg-gray-100 disabled:text-gray-500"
                disabled={filter.params.subsite == ""}
                onClick$={() => {
                  window.location.href = loc.url.pathname;
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
                Reset
              </button>

              <button
                class="flex cursor-pointer items-center gap-1 rounded-md bg-black p-2 px-4 text-white hover:bg-gray-800 disabled:cursor-default disabled:bg-gray-400"
                disabled={filter.params.subsite == ""}
                onClick$={async () => {
                  const url = loc.url.pathname + "?";
                  const searchParams = new URLSearchParams();
                  for (const key in filter.params)
                    if (filter.params[key] != "") {
                      searchParams.append(key, filter.params[key]);
                      filter.active = true;
                    }

                  nav(url + searchParams);

                  if (reloadFN) {
                    reloadFN.value?.();
                    filter.visible = false;
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
                Search
              </button>
            </div>
          </PopupModal>

          {/* <SiteNavigator /> */}

          <Table>
            <Dati
              DBTabella="vlan"
              title={t("network.vlan.vlanlist")}
              dati={vlanList.value}
              nomeTabella={"vlan"}
              OnModify={handleModify}
              OnDelete={handleDelete}
              funcReloadData={reloadData}
              onReloadRef={getREF}
            >
              <TextboxForm
                id="txtfilter"
                value={filter.params.query}
                ref={txtQuickSearch}
                placeholder={t("quicksearch")}
                onInput$={(e) => {
                  filter.params.query = (e.target as HTMLInputElement).value;
                  filter.active = false;
                  for (const item in filter.params) {
                    if (filter.params[item] && filter.params[item] != "") {
                      filter.active = true;
                      break;
                    }
                  }
                  if (reloadFN) reloadFN.value?.();
                }}
              />
              <div class="has-tooltip">
                <button
                  class="flex size-[32px] cursor-pointer items-center justify-center rounded-md bg-black p-1 text-white hover:bg-gray-700"
                  onClick$={() => (filter.visible = true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
                    />
                  </svg>
                </button>
                <span class="tooltip">{t("filters")}</span>
              </div>
              {filter.active && (
                <div class="has-tooltip">
                  <button
                    class="ms-2 flex size-[24px] cursor-pointer items-center justify-center rounded bg-red-500 text-white hover:bg-red-400"
                    onClick$={() => {
                      filter.active = false;
                      for (const key in filter.params) filter.params[key] = "";
                      nav(loc.url.pathname);
                      if (txtQuickSearch.value) txtQuickSearch.value.value = "";
                      reloadFN.value?.();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="size-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                    <span class="tooltip mb-1 ml-1.5">{t("erasefilters")}</span>
                  </button>
                </div>
              )}
            </Dati>
            <div class="flex">
              <ButtonAddLink
                nomePulsante={t("network.vlan.addvlan")}
                href={loc.url.href.replace("view", "insert")}
              ></ButtonAddLink>
              {/* <ImportCSV
                OnError={handleError}
                OnOk={handleOkay}
                nomeImport="vlan"
              /> */}
            </div>
          </Table>
        </div>
      ) : (
        <CRUDForm data={vlan} reloadFN={reloadFN} />
      )}
    </>
  );
});

// export const FormBox = component$(({ title }: { title?: string }) => {
//     return (<>
//         <div class="rounded-lg border border-gray-300">
//             {
//                 title &&
//                 <div class="w-full p-2 border-b-1 border-gray-200">
//                     <h1>{title}</h1>
//                 </div>
//             }
//             <div class="w-full *:w-full **:flex-1 *:flex p-4">
//                 <Slot></Slot>
//             </div>
//         </div>
//     </>)
// })

export const FormBox = component$(({ title }: { title?: string }) => {
  return (
    <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
      {title && (
        <div class="w-full border-b border-gray-100 bg-gray-50 p-4">
          <h1 class="text-lg font-semibold text-gray-700">{title}</h1>
        </div>
      )}
      <div class="flex w-full flex-col gap-4 p-6">
        <Slot></Slot>
      </div>
    </div>
  );
});

export const CRUDForm = component$(
  ({
    data
  }: {
    data?: VLANModel;
    reloadFN?: Signal<(() => void) | null>;
  }) => {
    const loc = useLocation();
    const action = useAction();

    const formData = useStore<VLANModel>({
      descrizionevlan: "",
      vid: 0,
      nomevlan: "",
    });

    const attempted = useSignal<boolean>(false);

    const networks = useSignal<ReteModel[]>([]);
    const vlans = useSignal<VLANModel[]>([]);

    useTask$(async () => {
      networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
      vlans.value = await getAllVLAN();

      if (loc.params.mode == "update") {
        Object.assign(formData, data);
        // console.log(formData);
      }
    });

    // return (
    //     <>

    //         <div class={
    //             "m-2 max-sm:*:my-2 gap-4 relative" +
    //             (action.value?.success ? "pointer-events-none opacity-50" : "")
    //         }>
    //             <div class="*:min-w-[480px] *:w-1/2 flex justify-center w-full">
    //                 <FormBox title="Informazioni">
    //                     <TextboxForm id="txtIDV" title="VID: " placeholder="es. 10" value={formData.vid.toString()} OnInput$={(e) => { formData.vid = parseInt((e.target as HTMLOptionElement).value); }} />
    //                     <TextboxForm id="txtName" title={$localize`Nome VLAN`} value={formData.nomevlan} placeholder="Es. VLAN_Security" OnInput$={(e) => formData.nomevlan = (e.target as HTMLInputElement).value} />
    //                     <TextboxForm id="txtDescrizione" title={$localize`Descrizione VLAN`} value={formData.descrizionevlan} placeholder="Es. VLAN for CCTVs" OnInput$={(e) => formData.descrizionevlan = (e.target as HTMLInputElement).value} />
    //                 </FormBox>
    //             </div>
    //         </div>
    //         <div class="w-full flex justify-center">
    //             <button onClick$={async (e) => {
    //                 e.preventDefault();
    //                 if (!formData.vid || formData.descrizionevlan == "" || formData.nomevlan == "") {
    //                     attempted.value = true;
    //                     return;
    //                 }
    //                 await action.submit({ ...formData });
    //                 if (action.value && action.value.success) {
    //                     await new Promise((resolve) => { setTimeout(resolve, 2000) });
    //                     window.location.href = loc.url.href.replace("insert", "view").replace("update", "view");
    //                 }

    //             }} class="bg-green-500 transition-all hover:bg-green-600 disabled:bg-green-300 rounded-md text-white p-2 mx-1 ms-4" disabled={
    //                 formData.vid <= 0 ||
    //                 formData.descrizionevlan == "" ||
    //                 formData.nomevlan == ""
    //             }>{$localize`Conferma`}</button>
    //             <a class="bg-red-500 hover:bg-red-600 transition-all rounded-md text-white p-2 inline-block mx-1" href={loc.url.href.replace("insert", "view").replace("update", "view")}>{$localize`Annulla`}</a>
    //             {action.submitted && action.value &&
    //                 <div class={action.value.success ? "bg-green-400 p-2 rounded-md text-white mt-2" : "bg-red-400 p-2 mt-2 rounded-md text-white"}>
    //                     {action.value.type_message == 1 && <span>{$localize`Inserimento avvenuto correttamente`}</span>}
    //                     {action.value.type_message == 2 && <span>{$localize`Modifica avvenuta correttamente`}</span>}
    //                     {action.value.type_message == 3 && <span>{$localize`Errore durante l'inserimento`}</span>}
    //                     {action.value.type_message == 4 && <span>{$localize`Errore durante la modifica`}</span>}
    //                 </div>
    //             }
    //         </div>
    //     </>
    // )

    const t = inlineTranslate();

    return (
      <>
        <div
          class={
            "relative m-2 w-full gap-4 max-sm:*:my-2 " +
            (action.value?.success ? "pointer-events-none opacity-50" : "")
          }
        >
          <div class="flex w-full justify-center">
            <FormBox title="Informazioni">
              <TextboxForm
                id="txtIDV"
                title="VID: "
                placeholder="es. 10"
                value={formData.vid.toString()}
                onInput$={(e) => {
                  formData.vid = parseInt((e.target as HTMLInputElement).value);
                }}
              />
              <TextboxForm
                id="txtName"
                title={t("network.vlan.vlanname")}
                value={formData.nomevlan}
                placeholder="Es. VLAN_Security"
                onInput$={(e) =>
                  (formData.nomevlan = (e.target as HTMLInputElement).value)
                }
              />
              <TextboxForm
                id="txtDescrizione"
                title={t("network.vlan.vlandescription")}
                value={formData.descrizionevlan}
                placeholder="Es. VLAN for CCTVs"
                onInput$={(e) =>
                (formData.descrizionevlan = (
                  e.target as HTMLInputElement
                ).value)
                }
              />
            </FormBox>
          </div>
        </div>

        <div class="mt-6 flex w-full justify-center gap-2">
          <button
            onClick$={async (e) => {
              e.preventDefault();
              if (
                !formData.vid ||
                formData.descrizionevlan == "" ||
                formData.nomevlan == ""
              ) {
                attempted.value = true;
                return;
              }
              await action.submit({ ...formData });
              if (action.value && action.value.success) {
                await new Promise((resolve) => {
                  setTimeout(resolve, 2000);
                });
                window.location.href = loc.url.href
                  .replace("insert", "view")
                  .replace("update", "view");
              }
            }}
            class="flex items-center gap-2 rounded-xl bg-green-500 px-6 py-2 text-base font-semibold text-white shadow transition-all duration-200 hover:bg-green-600 disabled:bg-green-300"
            disabled={
              formData.vid <= 0 ||
              formData.descrizionevlan == "" ||
              formData.nomevlan == ""
            }
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {t("confirm")}
          </button>
          <a
            class="flex items-center gap-2 rounded-xl bg-red-500 px-6 py-2 text-base font-semibold text-white shadow transition-all duration-200 hover:bg-red-600"
            href={loc.url.href
              .replace("insert", "view")
              .replace("update", "view")}
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {t("cancel")}
          </a>
        </div>

        {action.submitted && action.value && (
          <div
            class={
              action.value.success
                ? "mt-4 rounded-md bg-green-400 p-2 text-center text-white shadow"
                : "mt-4 rounded-md bg-red-400 p-2 text-center text-white shadow"
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
            {t(`action.result${action.value.type_message}`)}
          </div>
        )}
      </>
    );
  },
);
