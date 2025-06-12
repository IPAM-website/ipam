/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type {
  Signal
} from "@builder.io/qwik";
import {
  $,
  component$,
  getLocale,
  Slot,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type {
  RequestHandler
} from "@builder.io/qwik-city";
import {
  routeAction$,
  routeLoader$,
  server$,
  useLocation,
  useNavigate,
  z,
  zod$,
} from "@builder.io/qwik-city";
import { sqlForQwik } from "~/../db";
import SelectForm from "~/components/form/formComponents/SelectForm";
import TextboxForm from "~/components/form/formComponents/TextboxForm";
import type { ReteModel, VLANModel } from "~/dbModels";
import ButtonAddLink from "~/components/table/ButtonAddLink";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
//import ImportCSV from "~/components/table/ImportCSV";
import PopupModal from "~/components/ui/PopupModal";
import { inlineTranslate } from "qwik-speak";
import { getUser, isUserClient } from "~/fnUtils";
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

export const getVLANs = server$(async function (this, query = "") {
  const sql = sqlForQwik(this.env)
  let vlans: VLANModel[] = [];


  if (query == "") {
    const queryResult = await sql`SELECT * FROM vlan`;
    vlans = queryResult as unknown as VLANModel[];
    return vlans;
  }
  else {
    query+='%';
    const queryResult = await sql`SELECT * FROM vlan WHERE vlan.nomevlan LIKE ${query}`;
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

export const useSiteName = routeLoader$(async ({ params, env }) => {
  const sql = sqlForQwik(env)
  if (isNaN(parseInt(params.site)))
    return;
  return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0]
    .nomesito;
});

export const useAction = routeAction$(
  async (data, { env, params }) => {
    let success = false;
    let type_message = 0;
    try {
      const sql = sqlForQwik(env)
      const user = await getUser()
      if (params.mode == "update") {
        await sql.begin(async (tx) => {
          await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
          await tx.unsafe(`SET LOCAL app.client_id = '${user.id}'`);
          await tx`UPDATE vlan SET vid=${data.vid}, nomevlan=${data.nomevlan}, descrizionevlan=${data.descrizionevlan}, vxlan=${data.vxlan} WHERE vid=${data.vid}`;
        });
        type_message = 2;
      } else {
        await sql.begin(async (tx) => {
          await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
          await tx.unsafe(`SET LOCAL app.client_id = '${user.id}'`);
          await tx`INSERT INTO vlan(vid,nomevlan,descrizionevlan,vxlan) VALUES (${data.vid},${data.nomevlan},${data.descrizionevlan},${data.vxlan})`;
        });
        type_message = 1;
      }
      success = true;
    } catch (e) {
      if (params.mode == "update") type_message = 4;
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
    vxlan: z.number()
  }),
);

export const getAllVLAN = server$(async function () {
  const sql = sqlForQwik(this.env)
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
  const sql = sqlForQwik(this.env);
  let networks: ReteModel[] = [];
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

export const deleteVLAN = server$(async function (this, data) {
  const sql = sqlForQwik(this.env)
  const user = await getUser()
  try {
    if (isNaN(data.vid))
      throw new Error("vid non disponibile")
    if (data.address != "") {
      await sql.begin(async (tx) => {
        await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
        await tx.unsafe(`SET LOCAL app.client_id = '${user.id}'`);
        await tx`DELETE FROM vlan WHERE vid=${data.vid}`;
      });
    }
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
});

type Notification = {
  message: string;
  type: "success" | "error" | "loading";
};

export default component$(() => {
  // const notify = useNotify();
  const updateNotification = useSignal(false);
  const lang = getLocale("en");
  const vlanList = useSignal<VLANModel[]>([]);
  const networks = useSignal<ReteModel[]>([]);
  const loc = useLocation();
  const nav = useNavigate();
  const vlan = useStore<VLANModel>({
    descrizionevlan: "",
    nomevlan: "",
    vid: 0,
    vxlan: 0
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
  const user = useSignal<{ id: number; mail: string; admin: boolean }>();
  const isClient = useSignal<boolean>(false);

  useVisibleTask$(() => {
    const eventSource = new EventSource(`http://${window.location.hostname}:3010/events`);
    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        //console.log(data)
        // Se il clientId dell'evento è diverso dal mio, mostra la notifica
        if (isClient.value) {
          reloadFN.value?.()
        } else {
          if (data.table == "vlan") {
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
    isClient.value = await isUserClient()
    user.value = await getUser();
    vlanList.value = await getVLANs();
    networks.value = await getAllNetworksBySite(parseInt(loc.params.site));

    for (const [key, value] of loc.url.searchParams.entries()) {
      filter.params[key] = value;
      filter.active = true;
    }
  });

  const addNotification = $((message: string, type: "success" | "error" | "loading") => {
    notifications.value = [...notifications.value, { message, type }];
    if (type !== "loading") {
      setTimeout(() => {
        notifications.value = notifications.value.filter((n) => n.message !== message);
      }, 4000);
    }
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

  const query = useSignal<string>("");

  const reloadData = $(async () => {
    // if (filter.active)
    //     return await useAddresses(filter.params);
    // else
    return await getVLANs(query.value);
  });

  const getREF = $((reloadFunc: () => void) => {
    reloadFN.value = reloadFunc;
  });

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
      <div class="fixed top-8 left-1/2 z-50 flex flex-col items-center space-y-4 -translate-x-1/2">
        {notifications.value.map((notification, index) => (
          <div
            key={index}
            class={[
              "flex items-center gap-3 min-w-[320px] max-w-md rounded-xl px-6 py-4 shadow-2xl border-2 transition-all duration-300 text-base font-semibold",
              notification.type === "success"
                ? "bg-green-500/90 border-green-700 text-white"
                : notification.type === "error"
                  ? "bg-red-500/90 border-red-700 text-white"
                  : "bg-white border-blue-400 text-blue-800"
            ]}
            style={{
              filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.18))",
              opacity: 0.98,
            }}
          >
            {/* Icona */}
            {notification.type === "success" && (
              <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.type === "error" && (
              <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {notification.type === "loading" && (
              <svg class="h-7 w-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            )}

            {/* Messaggio */}
            <span class="flex-1">{notification.message}</span>
          </div>
        ))}
      </div>
      {/* <Title haveReturn={true} url={mode == "view" ? loc.url.pathname.split("vlan")[0] : loc.url.pathname.replace(mode, "view")} > {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} IP</Title> */}
      {mode == "view" ? (
        <div>
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
            <div class="mb-4 flex flex-col gap-2 rounded-t-xl border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-800 dark:text-gray-50">{t("network.vlan.vlanlist")}</span>
              </div>
              <div class="flex items-center gap-2">
                <TextboxForm
                  id="txtfilter"
                  search={true}
                  value={filter.params.query}
                  ref={txtQuickSearch}
                  placeholder={t("quicksearch")}
                  onInput$={(e) => {
                    query.value = (e.target as HTMLInputElement).value;
                    if (reloadFN) reloadFN.value?.();
                  }}
                />

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
              </div>
            </div>
            <div class={`flex flex-row items-center gap-2 mb-4 [&>*]:my-0 [&>*]:py-0 ${!isClient.value ? "" : "collapse"}`}>
              <ButtonAddLink
                nomePulsante={t("network.vlan.addvlan")}
                href={loc.url.href.replace("view", "insert")}
              ></ButtonAddLink>
            </div>
            <Dati
              DBTabella="vlan"
              title={t("network.vlan.vlanlist")}
              dati={vlanList.value}
              nomeTabella={"vlan"}
              OnModify={handleModify}
              OnDelete={handleDelete}
              funcReloadData={reloadData}
              onReloadRef={getREF}
              isClient={isClient.value}
            >
              {/* <div class="has-tooltip">
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
              </div> */}

            </Dati>
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
    <div class="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 shadow-lg">
      {title && (
        <div class="w-full border-b border-gray-100 bg-gray dark:bg-gray-800 p-4">
          <h1 class="text-lg font-semibold text-gray-700 dark:text-gray-100">{title}</h1>
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
    const user = useSignal<{ id: number; mail: string; admin: boolean }>();

    useTask$(async () => {
      user.value = await getUser();
    });

    const formData = useStore<VLANModel>({
      descrizionevlan: "",
      vid: 0,
      nomevlan: "",
      vxlan: 0
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
            <FormBox title={t("network.vlan.vlaninfo")}>
              <TextboxForm
                id="txtIDV"
                title={t("network.vlan.vid")}
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
              <TextboxForm
                type="number"
                id="txtVLAN"
                title="VXLAN:"
                value={formData.vxlan.toString()}
                placeholder="1, 2 ..."
                onInput$={(e) =>
                (formData.vxlan = parseInt((
                  e.target as HTMLInputElement
                ).value))
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
                formData.nomevlan == "" ||
                formData.vxlan == 0
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
