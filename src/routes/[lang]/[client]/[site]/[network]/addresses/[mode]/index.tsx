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
  useVisibleTask$
} from "@builder.io/qwik";
import type {
  RequestEventAction,
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
import { sqlForQwik } from '~/../db';
import AddressBox, {
  getNetwork,
} from "~/components/form/formComponents/AddressBox";
import DatePicker from "~/components/form/formComponents/DatePicker";
import SelectForm from "~/components/form/formComponents/SelectForm";
import TextboxForm from "~/components/form/formComponents/TextboxForm";
import type { ReteModel, VLANModel, IndirizziModel } from "~/dbModels";
import ButtonAddLink from "~/components/table/ButtonAddLink";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ImportCSV from "~/components/table/ImportCSV";
import PopupModal from "~/components/ui/PopupModal";
import BtnInfoTable from "~/components/table/btnInfoTable";
import TableInfoCSV from "~/components/table/tableInfoCSV";
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

export const getAddresses = server$(async function (
  this,
  filter = { empty: 1 },
) {
  const sql = sqlForQwik(this.env);
  filter.query = filter.query ? filter.query + "%" : (filter.query = "%");
  filter.query = (filter.query as string).trim();
  let addresses: IndirizziModel[] = [];


  if(isNaN(parseInt(this.params.site)) || isNaN(parseInt(this.params.network)))
    return [];
  
  if (filter.empty == 1) {
    const queryResult =
      await sql`SELECT * FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete 
        INNER JOIN siti_rete ON rete.idrete = siti_rete.idrete WHERE siti_rete.idsito=${this.params.site} AND siti_rete.idrete=${this.params.network}`;
    addresses = queryResult as unknown as IndirizziModel[];
    return addresses;
  }

  // if (this.query.has("network") || (filter.network != undefined && filter.network != '')) {

  if (isNaN(parseInt(filter.query))) {
    const queryResult =
      await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.params.network ?? filter.network} WHERE indirizzi.nome_dispositivo LIKE ${filter.query}`;
    addresses = queryResult as unknown as IndirizziModel[];
  } else {
    const queryResult =
      await sql`SELECT indirizzi.* FROM indirizzi INNER JOIN rete ON indirizzi.idrete=rete.idrete AND rete.idrete=${this.params.network ?? filter.network} WHERE indirizzi.ip LIKE ${filter.query}`;
    addresses = queryResult as unknown as IndirizziModel[];
  }

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

  return addresses;
});

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
    // console.log(data.data_inserimento);
    try {
      if (data.mode == "update") {
        await sql`UPDATE indirizzi SET ip=${data.to_ip}, idrete=${data.idrete}, vid=${data.vid}, n_prefisso=${data.n_prefisso}, tipo_dispositivo=${data.tipo_dispositivo}, brand_dispositivo=${data.brand_dispositivo}, nome_dispositivo=${data.nome_dispositivo}, data_inserimento=${data.data_inserimento} WHERE ip=${data.ip}`;
        type_message = 2;
      } else {
        await sql`INSERT INTO indirizzi(ip,idrete,vid,n_prefisso,tipo_dispositivo,brand_dispositivo,nome_dispositivo,data_inserimento) VALUES (${data.ip},${data.idrete},${data.vid},${data.n_prefisso},${data.tipo_dispositivo},${data.brand_dispositivo},${data.nome_dispositivo},${data.data_inserimento})`;
        type_message = 1;
      }
      success = true;
    } catch (e) {
      if (data.mode == "update") type_message = 4;
      else type_message = 3;
    }

    return {
      success,
      type_message,
    };
  },
  zod$({
    ip: z.string().min(8),
    idrete: z.number().positive(),
    vid: z.number().positive(),
    n_prefisso: z.number().positive().max(31).min(0),
    to_ip: z.string(),
    mode: z.string(),
    tipo_dispositivo: z.string(),
    brand_dispositivo: z.string(),
    nome_dispositivo: z.string(),
    data_inserimento: z.any(),
  }),
);

export const getAllVLAN = server$(async function () {
  const sql = sqlForQwik(this.env);
  let vlans: VLANModel[] = [];
  try {
    const query = await sql`SELECT * FROM vlan`;
    vlans = query as unknown as VLANModel[];
  } catch (e) {
    console.log(e);
  }

  return vlans;
});

export const deleteIP = server$(async function (data) {
  const sql = sqlForQwik(this.env);
  try {
    if (data.address != "")
      await sql`DELETE FROM indirizzi WHERE ip=${data.address}`;
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

function ipToLong(ip: string) {
  return ip.split('.').reduce((acc: number, octet: string) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function isIPInSubnet(ip: string, subnet: string, prefix: number) {
  const ipLong = ipToLong(ip);
  const subnetLong = ipToLong(subnet);
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return (ipLong & mask) === (subnetLong & mask);
}

export const insertIPFromCSV = server$(async function (data: string[][]) {
  const lang  = getLocale("en")
  const sql = sqlForQwik(this.env);
  try {
    const expectedHeaders = ["ip", "nome_dispositivo","tipo_dispositivo","brand_dispositivo","n_prefisso"];

    if (data.length === 0) {
      throw new Error(lang == "it" ? "CSV vuoto" : "CSV is empty");
    }

    const headerRow = data[0];
    const receivedHeaders = headerRow.map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());

    if (receivedHeaders.length !== expectedHeaders.length) {
      throw new Error(lang == "it" ? `Numero di colonne errato. Attese ${expectedHeaders.length}, ricevute ${receivedHeaders.length}` : `Number of columns incorrect. Expected ${expectedHeaders.length}, received ${receivedHeaders.length}`);
    }

    if (!receivedHeaders.every((h, index) => h === expectedHeaders[index].toLowerCase())) {
      throw new Error(lang == "it" ? `Intestazioni non valide. Atteso: ${expectedHeaders.join(", ")}` : `Invalid headers. Expected: ${expectedHeaders.join(", ")}`);
    }
    //console.log(data)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const [ipRow, nome_dispositivoRow, brand_dispositivoRow, tipo_dispositivoRow, n_prefissoRow] = row;
      const ip = ipRow.replace(/^"|"$/g, '').trim();
      const nome_dispositivo = nome_dispositivoRow.replace(/^"|"$/g, '').trim();
      const brand_dispositivo = brand_dispositivoRow.replace(/^"|"$/g, '').trim();
      const tipo_dispositivo = tipo_dispositivoRow.replace(/^"|"$/g, '').trim();
      const n_prefisso = parseInt(n_prefissoRow.replace(/^"|"$/g, '').trim());
      if (isNaN(n_prefisso))
        throw new Error("Prefisso non valido");
      //console.log(ip,nome_dispositivo,brand_dispositivo,tipo_dispositivo,n_prefisso)

      const pathParts = new URL(this.request.url).pathname.split('/');
      const reteId = parseInt(pathParts[4]);
      //console.log(reteId)

      const rete = await sql`
      SELECT iprete, prefissorete
      FROM rete
      WHERE idrete = ${reteId}
    `;
      if (rete.length === 0) throw new Error("Rete non trovata");

      const reteIndirizzo = rete[0].iprete;
      const retePrefisso = rete[0].prefissorete;

      if (!isIPInSubnet(ip, reteIndirizzo, retePrefisso)) {
        throw new Error(`L'indirizzo IP ${ip} non appartiene alla rete selezionata`);
      }

      const existingAddress = await sql`
        SELECT * FROM indirizzi
        WHERE ip = ${ip}
        AND idrete = ${reteId}
      `;
      if (existingAddress.length > 0) {
        throw new Error("Indirizzo esistente");
      } 

      const user = await getUser()
      await sql.begin(async (tx) => {
        await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
        await tx`INSERT INTO indirizzi(ip, idrete, n_prefisso, tipo_dispositivo, nome_dispositivo, brand_dispositivo, data_inserimento) VALUES (${ip},${reteId},${n_prefisso},${tipo_dispositivo},${nome_dispositivo},${brand_dispositivo},${new Date()})`;
      })
    }
    return {
      success: true,
      message:  lang === 'it' ? "Indirizzo inserito con successo" : "Address inserted successfully"
    }
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: lang === 'it' ? "Errore durante l'inserimento nel DB: " + e : "Error during insertion in the DB: " + e
    }
  }
})

export default component$(() => {
  // const notify = useNotify();
  const updateNotification = useSignal(false);
  const lang = getLocale("en");
  const addressList = useSignal<IndirizziModel[]>([]);
  const network = useSignal<ReteModel>();
  const loc = useLocation();
  const nav = useNavigate();
  const address = useStore<RowAddress>({});
  const filter = useStore<FilterObject>({
    active: false,
    visible: false,
    params: { network: "", query: "" },
  });
  const mode = loc.params.mode ?? "view";
  const txtQuickSearch = useSignal<HTMLInputElement>();
  const reloadFN = useSignal<(() => void) | null>(null);
  const notifications = useSignal<Notification[]>([]);
  const showPreview = useSignal(false);

  useVisibleTask$(() => {
    const eventSource = new EventSource(`http://${window.location.hostname}:3010/events`);
    eventSource.onmessage = async (event) => {
      try {
        //console.log(event)
        const data = JSON.parse(event.data);
        // Se il clientId dell'evento è diverso dal mio, mostra la notifica
        if (data.clientId !== localStorage.getItem('clientId')) {
          updateNotification.value = true;
        }
      } catch (e) {
        console.error('Errore parsing SSE:', event?.data);
      }
    };
    return () => eventSource.close();
  });

  useTask$(({ track }) => {
    track(() => loc.params.network);
    if (reloadFN.value) reloadFN.value();
  });

  useTask$(async () => {
    addressList.value = await getAddresses();
    network.value = (await getNetwork(
      parseInt(loc.params.network),
    )) as ReteModel;

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

  const handleError = $((error: any) => {
    console.log(error);
    addNotification(
      lang === "en" ? "Error during import" : "Errore durante l'importazione",
      "error",
    );
  });

  const handleOkay = $(async (data: any) => {
    addNotification(lang === "en" ? "Operation in progress..." : "Operazione in corso...", "loading");
    // console.log("ok");
    try {
      const result = await insertIPFromCSV(data)
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      if (result.success) {
        reloadFN.value?.()
        addNotification(result.message, 'success');
      } else {
        addNotification(result.message, 'error');
      }
    }
    catch (err) {
      console.log(err)
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Error during import: " + err : "Errore durante l'importazione: " + err, 'error');
    }
  });

  const handleModify = $((row: any) => {
    Object.assign(address, row as RowAddress);
    nav(loc.url.href.replace("view", "update"));
  });

  const handleDelete = $(async (row: any) => {
    addNotification(lang === "en" ? "Deleting..." : "Eliminazione in corso...", "loading");
    if (await deleteIP({ address: row.ip })) {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Deleted successfully" : "Eliminato con successo", "success");
      reloadFN.value?.()
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
    if(updateNotification.value){
      updateNotification.value = false;
    }
    if (filter.active) return await getAddresses(filter.params);
    else return await getAddresses();
  });

  const getREF = $((reloadFunc: () => void) => {
    reloadFN.value = reloadFunc;
  });

  const showPreviewCSV = $(() => {
    showPreview.value = true;
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
              ? "The addresses table has been updated."
              : "La tabella degli indirizzi è stata aggiornata."}
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
      {/* <Title haveReturn={true} url={mode == "view" ? loc.url.pathname.split('/info')[0].split('/').slice(0,4).join('/') : loc.url.pathname.replace(mode, "view")} > {sitename.value.toString()} - {mode.charAt(0).toUpperCase() + mode.substring(1)} IP</Title> */}
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
                                notifications.value = notifications.value.filter(n => n.type !== "loading");     <div class="flex-auto"></div>
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
            <div class="mb-4 flex flex-col gap-2 rounded-t-xl border-b border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg font-semibold text-gray-800 dark:text-gray-50">{t("network.addresses.addresslist")}</span>
                <BtnInfoTable showPreviewInfo={showPreviewCSV}></BtnInfoTable>
              </div>
              <div class="flex items-center gap-2">
                <TextboxForm
                  id="txtfilter"
                  search={true}
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
                                        </button>
                                        </div>} */}
              </div>
            </div>
            <div class="flex flex-row items-center gap-2 mb-4 [&>*]:my-0 [&>*]:py-0">
              <ButtonAddLink
                nomePulsante={t("network.addesses.addaddress")}
                href={loc.url.href.replace("view", "insert")}
              ></ButtonAddLink>
              <div>
                <ImportCSV
                  OnError={handleError}
                  OnOk={handleOkay}
                />
              </div>
            </div>
            <Dati
              DBTabella="indirizzi"
              title={t("network.addesses.ipaddresslist")}
              dati={addressList.value}
              nomeTabella={"indirizzi"}
              OnModify={handleModify}
              OnDelete={handleDelete}
              funcReloadData={reloadData}
              onReloadRef={getREF}
            ></Dati>
          </Table>
        </div>
      ) : (
        <CRUDForm data={address} reloadFN={reloadFN} />
      )}

      <PopupModal
        visible={showPreview.value}
        title={
          <div class="flex items-center gap-2">
            <svg
              class="h-6 w-6 text-cyan-600"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Formato richiesto per l'importazione CSV</span>
            <span class="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold tracking-wide text-cyan-700">
              CSV
            </span>
          </div>
        }
        onClosing$={() => {
          showPreview.value = false;
        }}
      >
        <TableInfoCSV tableName="indirizzi"></TableInfoCSV>
      </PopupModal>
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

export const CRUDForm = component$(({
    data
  }: {
    data?: RowAddress;
    reloadFN: Signal<(() => void) | null>;
  }) => {
    const lang = getLocale("en");
    const loc = useLocation();
    const action = useAction();

    const formData = useStore<RowAddress & { ipDest: string; prefix: string }>({
      tipo_dispositivo: "Other",
      prefix: "",
      ip: "",
      ipDest: "",
      vid: undefined,
      idrete: undefined,
      nome_dispositivo: "",
      brand_dispositivo: "",
      data_inserimento: "",
    });

    const ipErrors = useSignal<string[]>([]);
    const ipDestErrors = useSignal<string[]>([]);

    const attempted = useSignal<boolean>(false);
    const changeIP = useSignal<boolean>(false);

    const network = useSignal<ReteModel>();
    const vlans = useSignal<VLANModel[]>([]);

    const updateIP = useSignal<() => void>(() => { });

    const handleFUpdate = $((e: () => void) => (updateIP.value = e));

    useTask$(async ({ track }) => {
      track(() => loc.params.network);
      formData.idrete = parseInt(loc.params.network);

      network.value = (await getNetwork(
        parseInt(loc.params.network),
      )) as ReteModel;
      vlans.value = await getAllVLAN();

      if (loc.params.mode == "update") {
        Object.assign(formData, data);
        if (formData.n_prefisso)
          formData.prefix = formData.n_prefisso.toString();
        if (data?.tipo_dispositivo == undefined)
          formData.tipo_dispositivo = "Other";
        // console.log(formData);
      }
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
            <SelectForm
              id="cmbType"
              title="Tipologia: "
              name="Tipo Dispositivo"
              value={formData.tipo_dispositivo}
              OnClick$={(e) => {
                formData.tipo_dispositivo = (
                  e.target as HTMLOptionElement
                ).value;
              }}
              listName=""
            >
              <option value="Server" key="Server">
                Server
              </option>
              <option value="Controller" key="Controller">
                Controller
              </option>
              <option value="Router" key="Router">
                Router
              </option>
              <option value="Firewall" key="Firewall">
                Firewall
              </option>
              <option value="Other" key="Other">
                {t("other")}
              </option>
            </SelectForm>
            <TextboxForm
              id="txtName"
              title={t("network.addesses.devicename")}
              value={formData.nome_dispositivo}
              placeholder="Es. Server1"
              onInput$={(e) =>
              (formData.nome_dispositivo = (
                e.target as HTMLInputElement
              ).value)
              }
            />
            <TextboxForm
              id="txtModel"
              title={t("network.addesses.devicebrand")}
              value={formData.brand_dispositivo}
              placeholder="Es. Dell"
              onInput$={(e) =>
              (formData.brand_dispositivo = (
                e.target as HTMLInputElement
              ).value)
              }
            />
            <DatePicker
              id="dpData"
              name={t("network.addesses.insertdate")}
              value={formData.data_inserimento}
              OnInput$={(e) =>
              (formData.data_inserimento = (
                e.target as HTMLInputElement
              ).value)
              }
            />
          </FormBox>
          {/* <div> */}
          <FormBox title="Dettagli">
            <AddressBox
              title={
                loc.params.mode === "update"
                  ? lang == "it"
                    ? "IP Origine"
                    : "IP Origin"
                  : "IPv4"
              }
              addressType="host"
              forceUpdate$={handleFUpdate}
              currentIPNetwork={network.value?.idrete ?? -1}
              value={data?.ip}
              prefix={network.value?.prefissorete.toString() || ""}
              OnInput$={(e) => {
                if (e.complete) {
                  if (loc.params.mode == "update" && !e.exists)
                    e.errors.push(
                      lang == "en"
                        ? "The IP does not exists in current network."
                        : "L'indirizzo IP non esiste in questa rete.",
                    );
                  else if (loc.params.mode == "insert" && e.exists)
                    e.errors.push(
                      lang == "en"
                        ? "This IP already exists."
                        : "Questo IP esiste già",
                    );
                  else formData.ip = e.ip;
                }
                if (formData.prefix == "") formData.prefix = e.prefix;

                ipErrors.value = e.errors;
              }}
            />
            {attempted.value &&
              action.value &&
              !action.value.success &&
              !formData.ip && (
                <span class="text-red-600">{t("network.addesses.invalidipaddress")}</span>
              )}

            {ipErrors.value && action.value && !action.value.success && (
              <span class="text-red-600">
                {ipErrors.value.map((x: string) => (
                  <>
                    {x}
                    <br />
                  </>
                ))}
              </span>
            )}

            {
              //#region ChangeIP
              loc.params.mode === "update" && changeIP.value && (
                <div class="flex flex-col">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6 sm:ms-4 md:ms-6 lg:ms-8"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 17.25 12 21m0 0-3.75-3.75M12 21V3"
                    />
                  </svg>
                  <AddressBox
                    title="IP Dest"
                    value={formData.ip}
                    prefix={formData.prefix}
                    currentIPNetwork={formData.idrete ?? -1}
                    OnInput$={(e) => {
                      if (e.complete && e.errors.length == 0)
                        formData.ipDest = e.ip;
                      if (formData.prefix == "") formData.prefix = e.prefix;

                      ipDestErrors.value = e.errors;
                    }}
                  />
                </div>
              )
              //#endregion
            }

            <TextboxForm
              id="txtPrefix"
              value={formData.prefix}
              disabled="disabled"
              title={t("network.addesses.prefix")}
              placeholder="Network Prefix"
              onInput$={(e) => {
                formData.prefix = (e.target as any).value;
              }}
            />
            {attempted.value && !formData.prefix && (
              <span class="text-red-600">{t("network.addesses.invalidprefix")}</span>
            )}

            {/* <SelectForm id="cmbRete" title="Rete" name={$localize`Rete Associata`} value={formData.idrete?.toString() || ""} OnClick$={async (e) => { formData.idrete = parseInt((e.target as any).value); formData.prefix = ((await getNetwork(formData.idrete)) as ReteModel).prefissorete.toString(); updateIP.value() }} listName="">
                            {networks.value.map((x: ReteModel) => <option key={x.idrete} value={x.idrete}>{x.nomerete}</option>)}
                        </SelectForm> */}
            <TextboxForm
              id="txtNetwork"
              value={network.value?.iprete}
              disabled="disabled"
              title={t("network.addesses.associatednetwork")}
              placeholder="Network"
              onInput$={(e) => {
                formData.idrete = parseInt((e.target as any).value);
              }}
            />
            {/* {attempted.value && !formData.idrete && <span class="text-red-600">{$localize`Please select a network`}</span>} */}

            <SelectForm
              id="cmbVLAN"
              title="VLAN"
              name="VLAN"
              value={formData.vid?.toString() || "1"}
              OnClick$={(e) => {
                formData.vid = parseInt((e.target as any).value);
              }}
              listName=""
            >
              {vlans.value.map((x: VLANModel) => (
                <option key={x.vid} value={x.vid}>
                  {x.nomevlan}
                </option>
              ))}
            </SelectForm>
            {attempted.value && !formData.vid && (
              <span class="text-red-600">{t("network.addesses.selectvlan")}</span>
            )}
          </FormBox>
          {/* <FormBox title="Selettore">
                        <div class="p-2">
                            { Array(Math.pow(2,32-network.value!.prefissorete)).fill(0).map((x,i)=> 
                            <button key={i} class="p-2 w-[16px] h-[16px] border border-black" onClick$={() => { 
                                let ip = network.value?.iprete.split('.').map(x=>parseInt(x)) as number[];
                                ip[3]+=i;
                                for(let i=2;i>=0;i--)
                                {
                                    if(ip[i+1]>255)
                                    {
                                        ip[i+1]=0;
                                        ip[i-1]++;
                                    }
                                }
                             }}>{i}</button>
                            ) }
                        </div>
                    </FormBox> */}
          {/* </div> */}
          {loc.params.mode === "update" && (
            <button
              class="absolute top-16 -right-8"
              onClick$={() => {
                changeIP.value = !changeIP.value;
              }}
            >
              {changeIP.value ? (
                <div class="has-tooltip relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>{" "}
                  <span class="tooltip">{t("network.addesses.remove")}</span>{" "}
                </div>
              ) : (
                <div class="has-tooltip relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                    />
                  </svg>{" "}
                  <span class="tooltip">{t("network.addesses.changeip")}</span>{" "}
                </div>
              )}
            </button>
          )}
        </div>

        <div class="mt-6 flex w-full justify-center gap-2">
          <button
            onClick$={async (e) => {
              e.preventDefault();
              if (
                !formData.prefix ||
                !formData.ip ||
                !formData.idrete ||
                !formData.vid
              ) {
                attempted.value = true;
                if (isNaN(parseInt(formData.prefix))) formData.prefix = "";
                return;
              }
              await action.submit({
                n_prefisso: parseInt(formData.prefix),
                ip: formData.ip,
                idrete: formData.idrete,
                vid: formData.vid,
                to_ip: changeIP.value ? formData.ipDest : formData.ip,
                mode: loc.params.mode,
                nome_dispositivo: formData.nome_dispositivo ?? "",
                tipo_dispositivo: formData.tipo_dispositivo ?? "",
                brand_dispositivo: formData.brand_dispositivo ?? "",
                data_inserimento:
                  new Date(formData.data_inserimento ?? "").toString() ==
                    "Invalid Date"
                    ? null
                    : new Date(formData.data_inserimento!).toString(),
              });
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
              ipErrors.value.length > 0 ||
              ipDestErrors.value.length > 0 ||
              formData.ip == "" ||
              !formData.idrete ||
              !formData.vid ||
              formData.prefix == ""
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
            <span>{t(`action.result${action.value.type_message}`)}</span>
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
          </div>
        )}

        

      </>
    );
  },
);
