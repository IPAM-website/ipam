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
import AddressBox from "~/components/form/formComponents/AddressBox";
import SelectForm from "~/components/form/formComponents/SelectForm";
import TextboxForm from "~/components/form/formComponents/TextboxForm";
import type {
  ReteModel,
  IntervalloModel
} from "~/dbModels";
import ButtonAddLink from "~/components/table/ButtonAddLink";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
//import ImportCSV from "~/components/table/ImportCSV";
import { inlineTranslate } from "qwik-speak";
import { getUser } from "~/fnUtils";
// import { useNotify } from "~/services/notifications";

export const onRequest: RequestHandler = ({ params, redirect, url }) => {
  if (!["view", "insert", "update"].includes(params.mode)) {
    const splitURL = url.href.split("/");
    splitURL.pop();
    splitURL.pop();
    throw redirect(301, splitURL.join("/") + "/view");
  }
};

export interface FilterObject {
  active: boolean;
  visible: boolean;
  params: {
    [key: string]: string;
  };
}

export const getIntervals = server$(async function (
  this,
  filter = { empty: 1 },
) {
  const sql = sqlForQwik(this.env);
  filter.query = filter.query ? filter.query + "%" : (filter.query = "%");
  filter.query = (filter.query as string).trim();
  let intervals: IntervalloModel[] = [];

  if (filter.empty == 1) {
    const queryResult =
      await sql`SELECT * FROM intervalli INNER JOIN siti_rete ON intervalli.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site}`;
    intervals = queryResult as unknown as IntervalloModel[];
    return intervals;
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

  return intervals;
});

export const useSiteName = routeLoader$(async ({ params, env }) => {
  const sql = sqlForQwik(env);
  if (isNaN(parseInt(params.site)))
    return;
  return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0]
    .nomesito;
});

export const useAction = routeAction$(async (data, {env , params}) => {
    const sql = sqlForQwik(env);
    let success = false;
    let type_message = 0;
    const user = await getUser()
    const clientId = data.clientId;
    try {
      if (params.mode == "update") {
        await sql.begin(async (tx) => {
          await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
          if (clientId) {
            await tx.unsafe(`SET LOCAL app.client_id = '${clientId}'`);
          }
          await tx`UPDATE intervalli SET nomeintervallo= ${data.nomeintervallo},iniziointervallo = ${data.iniziointervallo}, lunghezzaintervallo = ${data.lunghezzaintervallo}, fineintervallo=${data.fineintervallo},idrete=${data.idrete} WHERE idintervallo=${data.idintervallo}`;
        });
        type_message = 2;
      } else {
        await sql.begin(async (tx) => {
          await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
          if (clientId) {
            await tx.unsafe(`SET LOCAL app.client_id = '${clientId}'`);
          }
          await tx`INSERT INTO intervalli(nomeintervallo,iniziointervallo,lunghezzaintervallo,fineintervallo,idrete) VALUES (${data.nomeintervallo},${data.iniziointervallo},${data.lunghezzaintervallo},${data.fineintervallo},${data.idrete})`;
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
    idintervallo: z.number(),
    nomeintervallo: z.string(),
    iniziointervallo: z.string(),
    lunghezzaintervallo: z.number(),
    fineintervallo: z.string(),
    idrete: z.number(),
    clientId: z.string().optional(),
  }),
);

export const getAllIntervals = server$(async function () {
  const sql = sqlForQwik(this.env);
  let intervals: IntervalloModel[] = [];
  try {
    const query = await sql`SELECT * FROM intervalli`;
    intervals = query as unknown as IntervalloModel[];
  } catch (e) {
    console.log(e);
  }

  return intervals;
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

export const deleteInterval = server$(async function (this, data) {
  const sql = sqlForQwik(this.env)
  const user = await getUser()
  const clientId = data.clientId;
  try {
    if (isNaN(data.idintervallo))
      throw new Error("idintervallo non disponibile")
    await sql.begin(async (tx) => {
      await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
      if (clientId) {
        await tx.unsafe(`SET LOCAL app.client_id = '${clientId}'`);
      }
      await tx`DELETE FROM intervalli WHERE idintervallo=${data.idintervallo}`;
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
});

export const isOccupied = server$(async function (this, data) {
  const sql = sqlForQwik(this.env)
  try {
    if (this.params.mode == "insert") {
      const result = await sql`
            SELECT COUNT(*) as count 
            FROM indirizzi 
            WHERE ip >= ${data.iniziointervallo} AND ip <= ${data.fineintervallo} AND idrete = ${data.idrete}
            UNION 
            SELECT COUNT(*) as count 
            FROM intervalli 
            WHERE idrete = ${data.idrete} 
            
            AND (
            (iniziointervallo >= ${data.iniziointervallo} AND iniziointervallo <= ${data.fineintervallo}) 
            OR (fineintervallo >= ${data.iniziointervallo} AND fineintervallo <= ${data.fineintervallo}) 
            OR (iniziointervallo <= ${data.iniziointervallo} AND fineintervallo >= ${data.fineintervallo})
            )
        `;
      const count = result.reduce((acc: number, i: any) => {
        if (acc === undefined) acc = 0;
        return acc + parseInt(i.count, 10);
      }, 0);
      return count > 0;
    } else if (this.params.mode == "update") {
      const result = await sql`
            SELECT COUNT(*) as count 
            FROM indirizzi 
            WHERE ip >= ${data.iniziointervallo} AND ip <= ${data.fineintervallo} AND idrete = ${data.idrete}
            UNION 
            SELECT COUNT(*) as count 
            FROM intervalli 
            WHERE idrete = ${data.idrete} 
            AND idintervallo != ${data.idintervallo} -- Exclude the current interval in update mode
            AND (
            (iniziointervallo >= ${data.iniziointervallo} AND iniziointervallo <= ${data.fineintervallo}) 
            OR (fineintervallo >= ${data.iniziointervallo} AND fineintervallo <= ${data.fineintervallo}) 
            OR (iniziointervallo <= ${data.iniziointervallo} AND fineintervallo >= ${data.fineintervallo})
            )
        `;
      const count = result.reduce((acc: number, i: any) => {
        if (acc === undefined) acc = 0;
        return acc + parseInt(i.count, 10);
      }, 0);
      return count > 0;
    }

    return false;
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
  const lang = getLocale("en");
  const updateNotification = useSignal(false);
  const intervalList = useSignal<IntervalloModel[]>([]);
  const networks = useSignal<ReteModel[]>([]);
  const loc = useLocation();
  const nav = useNavigate();
  const interval = useStore<IntervalloModel>({
    fineintervallo: "",
    idintervallo: 0,
    idrete: 0,
    iniziointervallo: "",
    lunghezzaintervallo: 0,
    nomeintervallo: "",
    descrizioneintervallo: "",
  });
  const filter = useStore<FilterObject>({
    active: false,
    visible: false,
    params: { network: "", query: "" },
  });
  const mode = loc.params.mode ?? "view";
  const reloadFN = useSignal<(() => void) | null>(null);
  const notifications = useSignal<Notification[]>([]);

  useTask$(async () => {
    intervalList.value = await getAllIntervals();
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

  useVisibleTask$(() => {
      const eventSource = new EventSource(`http://${window.location.hostname}:3010/events`);
      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          //console.log(data)
          // Se il clientId dell'evento è diverso dal mio, mostra la notifica
          if (data.table == "intervalli"){
            if (data.clientId !== localStorage.getItem('clientId')) {
              updateNotification.value = true;
            }
          }
        } catch (e) {
          console.error('Errore parsing SSE:', event?.data);
        }
      };
      return () => eventSource.close();
    });

  /*const handleError = $((error: any) => {
    console.log(error);
    addNotification(
      lang === "en" ? "Error during import" : "Errore durante l'importazione",
      "error",
    );
  });

  /*const handleOkay = $(() => {
    // console.log("ok");
    addNotification(
      lang === "en"
        ? "Import completed successfully"
        : "Importazione completata con successo",
      "success",
    );
  });*/

  const handleModify = $((row: any) => {
    Object.assign(interval, row as IntervalloModel);
    nav(loc.url.href.replace("view", "update"));
  });

  const handleDelete = $(async (row: any) => {
    addNotification(lang === "en" ? "Operation in progress..." : "Operazione in corso...", "loading");
    const clientId = localStorage.getItem('clientId')
    if (await deleteInterval({ idintervallo: row.idintervallo, clientId })) {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(
        lang === "en" ? "Deleted successfully" : "Eliminato con successo",
        "success",
      );
    }
    else {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(
        lang === "en"
          ? "Error during deletion"
          : "Errore durante l'eliminazione",
        "error",
      );
    }
  });

  const reloadData = $(async () => {
    // if (filter.active)
    //     return await get(filter.params);
    // else
    return await getAllIntervals();
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
              ? "The intervals table has been updated. Click the 'Reload' button to refresh the table."
              : "La tabella degli intervalli è stata aggiornata. Clicca il pulsante 'Ricarica' per aggiornare la tabella."}
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
      {/* <Title haveReturn={true} url={mode == "view" ? loc.url.pathname.split("intervals")[0] : loc.url.pathname.replace(mode, "view")} > {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} Intervals</Title> */}
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

          {/* <SiteNavigator /> */}

          <Table>
            <div class="mb-4 flex flex-col gap-2 rounded-t-xl border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 px-4 py-6 md:flex-row md:items-center md:justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-800 dark:text-gray-50">{t("network.interval.intervallist")}</span>
              </div>
            </div>
            <div class="flex flex-row items-center gap-2 mb-4 [&>*]:my-0 [&>*]:py-0">
              <ButtonAddLink
                nomePulsante={t("network.interval.addinterval")}
                href={loc.url.href.replace("view", "insert")}
              ></ButtonAddLink>
              {/* <ImportCSV
                OnError={handleError}
                OnOk={handleOkay}
                nomeImport="intervallo"
              /> */}
            </div>
            <Dati
              DBTabella="intervalli"
              title={t("network.interval.intervallist")}
              dati={intervalList.value}
              nomeTabella={"intervalli"}
              OnModify={handleModify}
              OnDelete={handleDelete}
              funcReloadData={reloadData}
              onReloadRef={getREF}
            >
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
                                    }} /> */}
              {/* <div class="has-tooltip">
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
                                    < /button></div>} */}
            </Dati>
          </Table>
        </div>
      ) : (
        <CRUDForm data={interval} reloadFN={reloadFN} />
      )}
    </>
  );
});

export const FormBox = component$(({ title }: { title?: string }) => {
  return (
    <>
      <div class="rounded-lg border border-gray-300 shadow-sm">
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
    data,
  }: {
    data?: IntervalloModel;
    reloadFN?: Signal<(() => void) | null>;
  }) => {
    const loc = useLocation();
    const action = useAction();
    const clientId = localStorage.getItem('clientId') ?? undefined;

    const network = useSignal<ReteModel>();

    const formData = useStore<IntervalloModel>({
      fineintervallo: "",
      idintervallo: 0,
      idrete: 0,
      iniziointervallo: "",
      lunghezzaintervallo: 0,
      nomeintervallo: "",
      descrizioneintervallo: ""
    });

    const attempted = useSignal<boolean>(false);

    const networks = useSignal<ReteModel[]>([]);
    const intervals = useSignal<IntervalloModel[]>([]);

    const ipErrors = useSignal<string[]>([]);
    const ipFineErrors = useSignal<string[]>([]);
    const alreadyOccupied = useSignal<boolean>(false);

    useTask$(async () => {
      Object.assign(formData, data as IntervalloModel);

      networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
      intervals.value = await getAllIntervals();

      network.value = networks.value.find(
        (x) => x.idrete == parseInt(loc.url.searchParams.get("network") || "0"),
      );
      // console.log(network.value)
    });

    const updateFIP = useSignal<() => void>(() => { });

    const handleUpdate = $((e: () => void) => {
      updateFIP.value = e;
    });


    const t = inlineTranslate();

    return (
      <>
        <div
          class={
            "relative m-2 gap-4 max-sm:*:my-2 sm:grid sm:grid-cols-2 " +
            (action.value?.success ? "pointer-events-none opacity-50" : "")
          }
        >
          <FormBox title="Informazioni">
            <TextboxForm
              id="txtName"
              title={t("network.interval.intervalname")}
              value={formData.nomeintervallo}
              placeholder="Es. Intervallo 1"
              onInput$={(e) =>
                (formData.nomeintervallo = (e.target as HTMLInputElement).value)
              }
            />
            <TextboxForm
              id="txtModel"
              title={t("network.interval.intervaldescription")}
              value={formData.descrizioneintervallo}
              placeholder="Es. Pool indirizzi ufficio 1"
              onInput$={(e) =>
              (formData.descrizioneintervallo = (
                e.target as HTMLInputElement
              ).value)
              }
            />
          </FormBox>
          <FormBox title="Dettagli">
            <AddressBox
              title={t("network.interval.initialIP")}
              disabled={loc.params.mode == "update"}
              addressType="host"
              currentIPNetwork={formData.idrete ?? -1}
              prefix={network.value?.prefissorete.toString()}
              value={formData.iniziointervallo}
              OnInput$={(e) => {
                // console.log(formData.idrete);
                if (e.complete) {
                  formData.iniziointervallo = e.ip;

                  if (formData.fineintervallo != "") {
                    const parsedIP = formData.iniziointervallo
                      .split(".")
                      .map((x) => parseInt(x));
                    const parsedFineIP = formData.fineintervallo
                      .split(".")
                      .map((x) => parseInt(x));

                    let distance = 0;

                    for (const [i, v] of parsedIP.entries()) {
                      distance +=
                        (parsedFineIP[i] - v) * Math.pow(2, 8 * (3 - i));
                    }

                    if (distance < 1) {
                      ipFineErrors.value.push("Interval size is invalid");
                      return;
                    }
                    formData.lunghezzaintervallo = distance;
                    // console.log(distance);

                    isOccupied(formData).then(
                      (result) => (alreadyOccupied.value = result),
                    );
                  }
                }

                ipErrors.value = e.errors;
              }}
            />
            {attempted.value && !formData.iniziointervallo && (
              <span class="text-red-600">{t("network.interval.invalidipaddress")}</span>
            )}

            {ipErrors.value && (
              <span class="text-red-600">
                {ipErrors.value.map((x: string) => (
                  <>
                    {x}
                    <br />
                  </>
                ))}
              </span>
            )}

            <AddressBox
              title={t("network.interval.finalIP")}
              disabled={loc.params.mode == "update"}
              addressType="host"
              value={formData.fineintervallo}
              currentIPNetwork={formData.idrete ?? -1}
              prefix={network.value?.prefissorete.toString()}
              forceUpdate$={handleUpdate}
              OnInput$={(e) => {
                ipFineErrors.value = e.errors;

                if (e.complete && formData.iniziointervallo != "") {
                  const parsedIP = formData.iniziointervallo
                    .split(".")
                    .map((x) => parseInt(x));
                  const parsedFineIP = e.ip.split(".").map((x) => parseInt(x));

                  let distance = 0;

                  for (const [i, v] of parsedIP.entries()) {
                    distance +=
                      (parsedFineIP[i] - v) * Math.pow(2, 8 * (3 - i));
                  }

                  if (distance < 1) {
                    ipFineErrors.value.push("Interval size is invalid");
                    return;
                  }

                  formData.fineintervallo = e.ip;
                  formData.lunghezzaintervallo = distance;
                  isOccupied(formData).then(
                    (result) => (alreadyOccupied.value = result),
                  );
                }
              }}
            />

            {ipFineErrors.value && (
              <span class="text-red-600">
                {ipFineErrors.value.map((x: string) => (
                  <>
                    {x}
                    <br />
                  </>
                ))}
              </span>
            )}

            <TextboxForm
              id="txtLunghezza"
              value={formData.lunghezzaintervallo.toString()}
              title={t("length")}
              placeholder="Interval Length"
              onInput$={(e) => {
                const lunghezza = parseInt(
                  (e.target as HTMLInputElement).value,
                );
                if (isNaN(lunghezza)) return;

                formData.lunghezzaintervallo = parseInt(
                  (e.target as any).value,
                );
                // modificare indirizzo finale
                const parsedIP = formData.iniziointervallo
                  .split(".")
                  .map((x) => parseInt(x));
                parsedIP[3] += lunghezza;
                for (let i = 3; i > 1; i--) {
                  if (isNaN(parsedIP[i])) return;

                  if (parsedIP[i] >= 256) {
                    parsedIP[i - 1] =
                      parsedIP[i - 1] + Math.trunc(parsedIP[i] / 256);
                    parsedIP[i] = parsedIP[i] % 256;
                  } else break;
                }
                formData.fineintervallo = parsedIP.join(".");
                updateFIP.value();
                isOccupied(formData).then(
                  (result) => (alreadyOccupied.value = result),
                );
              }}
            />
            {attempted.value && !formData.lunghezzaintervallo && (
              <span class="text-red-600">{t("network.intervals.invalidlength")}</span>
            )}

            <SelectForm
              id="cmbRete"
              title="Rete"
              disabled={true}
              name={t("network.intervals.associatenetwork")}
              value={loc.params.network}
              OnClick$={async (e) => {
                formData.idrete = parseInt(
                  (e.target as HTMLOptionElement).value,
                );
                network.value = networks.value.find(
                  (x) => x.idrete == formData.idrete,
                );
              }}
              listName=""
            >
              {networks.value.map((x: ReteModel) => (
                <option key={x.idrete} value={x.idrete}>
                  {x.nomerete}
                </option>
              ))}
            </SelectForm>
            {attempted.value && !formData.idrete && (
              <span class="text-red-600">{t("network.intervals.selectnetwork")}</span>
            )}

            {alreadyOccupied.value && (
              <span class="text-red-600">{t("network.intervals.alreadyoccupiedspace")}</span>
            )}
          </FormBox>
        </div>
        <div class="mt-6 flex w-full justify-center gap-2">
          <button
            onClick$={async (e) => {
              e.preventDefault();
              if (
                !formData.lunghezzaintervallo ||
                formData.iniziointervallo == "" ||
                !formData.idrete
              ) {
                attempted.value = true;
                if (isNaN(formData.lunghezzaintervallo))
                  formData.lunghezzaintervallo = 0;
                return;
              }
              await action.submit({ ...formData, clientId});
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
              !formData.lunghezzaintervallo ||
              formData.iniziointervallo == "" ||
              !formData.idrete
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

            {t(`action.result${action.value.type_message}`)}
          </div>
        )}
      </>
    );
  },
);
