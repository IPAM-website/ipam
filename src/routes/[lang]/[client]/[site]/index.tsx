/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  $,
  component$,
  getLocale,
  useSignal,
  useStore,
  useTask$
} from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  server$,
  useLocation,
  useNavigate,
  z,
  zod$,
} from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import sql from "../../../../../db";
import type {
  CittaModel,
  ClienteModel,
  ReteModel,
  SiteModel,
  VLANModel,
  VRFModel,
} from "~/dbModels";
import Table from "~/components/table/Table";
import Dati_Headers from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import PopupModal from "~/components/ui/PopupModal";
import AddressBox from "~/components/form/formComponents/AddressBox";
import TextboxForm from "~/components/form/formComponents/TextboxForm";
import Import from "~/components/table/ImportCSV";
import SelectForm from "~/components/form/formComponents/SelectForm";
import CHKForms from "~/components/form/formComponents/CHKForms";
import SelectFormLive from "~/components/form/formComponents/SelectFormLive";
import { inlineTranslate } from "qwik-speak";
import { getUser } from "~/fnUtils";
import BtnInfoTable from "~/components/table/btnInfoTable";
import TableInfoCSV from "~/components/table/tableInfoCSV";

type Notification = {
  message: string;
  type: "success" | "error" | "loading";
};

export const getSite = server$(async function (idsito: number) {
  let site: SiteModel = {
    idsito: -1,
    nomesito: "",
    datacenter: false,
    idcitta: 0,
    tipologia: "",
  };
  try {
    if (isNaN(idsito)) {
      return site;
    }
    const query = await sql`SELECT * FROM siti WHERE siti.idsito=${idsito}`;
    site = query[0] as SiteModel;
  } catch (e) {
    console.log(e);
  }

  return site;
});

export const getClient = server$(async function (idclient: number) {
  let client: ClienteModel = {
    idcliente: -1,
    nomecliente: "",
    telefonocliente: "",
  };
  try {
    if (isNaN(idclient)) {
      return client;
    }
    const query =
      await sql`SELECT * FROM clienti WHERE clienti.idcliente=${idclient}`;
    client = query[0] as ClienteModel;
  } catch (e) {
    console.log(e);
  }

  return client;
});

export const getAllNetworksBySite = server$(async function (idsito: number) {
  let networks: ReteModel[] = [];
  try {
    if (isNaN(idsito)) {
      throw new Error("idsito non valido")
    }
    const query =
      await sql`SELECT rete.* FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete 
                                WHERE siti_rete.idsito=${idsito}`;
    networks = query as unknown as ReteModel[];
  } catch (e) {
    console.log(e);
  }

  return networks;
});

export const getAllVRF = server$(async () => {
  let vrf: VRFModel[] = [];
  try {
    const query = await sql`SELECT * FROM vrf`;
    vrf = query as unknown as VRFModel[];
  } catch (e) {
    console.log(e);
  }

  return vrf;
});

export const getAllVLAN = server$(async function () {
  let vlans: VLANModel[] = [];
  try {
    const query = await sql`SELECT * FROM vlan`;
    // console.log(query);
    vlans = query as unknown as VLANModel[];
  } catch (e) {
    console.log(e);
  }

  return vlans;
});

export const deleteNetwork = server$(async function (data) {
  try {
    if (isNaN(data)) {
      throw new Error("idrete non valido");

    }
    await sql`DELETE FROM siti_rete WHERE siti_rete.idrete = ${data}`;
    await sql`DELETE FROM rete WHERE rete.idrete = ${data}`;
    return {
      success: true,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
    };
  }
});

export const useInsertNetwork = routeAction$(
  async function (data, e) {
    try {
      if (data.idretesup)
        await sql`INSERT INTO rete (nomerete,descrizione,vrf,iprete,prefissorete,idretesup,vid) VALUES (${data.nomerete},${data.descrizione},${data.vrf},${data.iprete},${data.prefissorete},${data.idretesup},${data.vid})`;
      else
        await sql`INSERT INTO rete (nomerete,descrizione,vrf,iprete,prefissorete,vid) VALUES (${data.nomerete},${data.descrizione},${data.vrf},${data.iprete},${data.prefissorete},${data.vid})`;
      const id = (
        await sql`SELECT idrete FROM rete ORDER BY idrete DESC LIMIT 1`
      )[0].idrete;
      await sql`INSERT INTO siti_rete VALUES (${e.params.site},${id})`;

      const isDatacenter = (
        await sql`SELECT datacenter FROM siti WHERE idsito = ${e.params.site}`
      )[0].datacenter;
      if (isDatacenter) {
        const allDatacenters = (
          await sql`SELECT idsito FROM siti WHERE datacenter=true AND tipologia!='disaster recovery' AND idcliente = ${e.params.client}`
        )
          .map((x) => x.idsito)
          .filter((x) => x != e.params.site);
        for (const dc of allDatacenters) {
          await sql`INSERT INTO siti_rete VALUES (${dc},${id})`;
        }
      }
      return {
        success: true,
        message: "",
      };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        message: "",
      };
    }
  },
  zod$({
    descrizione: z.string(),
    nomerete: z.string(),
    vrf: z.number(),
    iprete: z.string(),
    prefissorete: z.any(),
    vid: z.number(),
    idretesup: z.number().optional().nullable(),
  }),
);

export const useUpdateNetwork = routeAction$(
  async function (data) {
    try {
      if (data.idretesup)
        await sql`UPDATE rete SET nomerete = ${data.nomerete}, descrizione = ${data.descrizione}, vrf = ${data.vrf}, prefissorete = ${data.prefissorete}, idretesup = ${data.idretesup} , iprete = ${data.iprete}, vid = ${data.vid} WHERE idrete = ${data.idrete}`;
      else
        await sql`UPDATE rete SET nomerete = ${data.nomerete}, descrizione = ${data.descrizione}, vrf = ${data.vrf}, prefissorete = ${data.prefissorete} , iprete = ${data.iprete}, vid = ${data.vid} WHERE idrete = ${data.idrete}`;

      return {
        success: true,
        message: "",
      };
    } catch (e) {
      console.log(e);
      return {
        success: false,
        message: "",
      };
    }
  },
  zod$({
    descrizione: z.string(),
    nomerete: z.string(),
    vrf: z.number(),
    iprete: z.string(),
    idrete: z.number(),
    prefissorete: z.any(),
    vid: z.number(),
    idretesup: z.number().optional().nullable(),
  }),
);

export const getCity = server$(async function (data) {
  if (isNaN(data))
    return undefined;
  return (await sql`SELECT citta.* FROM citta INNER JOIN siti ON citta.idcitta=siti.idcitta WHERE siti.idsito=${data}`)[0] as unknown as CittaModel;
})

export const reloadData = server$(async function () {
  return (await sql`SELECT rete.* FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE siti_rete.idsito=${this.params.site}`) as unknown as ReteModel[];
});

export const insertNetworkFromCSV = server$(async function (data: string[][]) {
  const lang = getLocale("en")
  try {
    const expectedHeaders = ["iprete", "nomerete","descrizione","prefissorete"];

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
    //console.log("handle ok server",data[1])
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const [ipReteRow, nomereteRow, descrizioneRow, prefissoReteRow] = row;
      const ipRete = ipReteRow.replace(/^"|"$/g, '').trim();
      const prefissoRete = parseInt(prefissoReteRow.replace(/^"|"$/g, '').trim());
      const nomerete = nomereteRow.replace(/^"|"$/g, '').trim();
      const descrizione = descrizioneRow.replace(/^"|"$/g, '').trim();
      //console.log(ipRete.toString(),prefissoRete.toString(),nomerete.toString(),descrizione.toString())

      //Ricerca se nome rete esiste gia' nel sito
      const pathParts = new URL(this.request.url).pathname.split('/');
      const siteId = parseInt(pathParts[3]);
      //console.log(siteId)
      if (isNaN(siteId)) {
        throw new Error("ID sito non valido nell'URL");
      }
      const existingNetwork = await sql`
        SELECT r.idrete 
        FROM rete r
        JOIN siti_rete sr ON r.idrete = sr.idrete
        WHERE 
          r.iprete = ${ipRete} 
          AND r.prefissorete = ${prefissoRete}
          AND sr.idsito = ${siteId}
      `;
      if (existingNetwork.length > 0) {
        throw new Error(`La rete ${ipRete}/${prefissoRete} esiste già nel sito ID ${siteId}`);
      }

      const user = await getUser()
      await sql.begin(async (tx) => {
        await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
        const newNetwork = await tx`
          INSERT INTO rete 
            (nomerete, descrizione, iprete, prefissorete) 
          VALUES 
            (${nomerete}, ${descrizione}, ${ipRete}, ${prefissoRete})
          RETURNING idrete
        `;
        await tx`
          INSERT INTO siti_rete 
            (idsito, idrete) 
          VALUES 
            (${siteId}, ${newNetwork[0].idrete})
        `;
      })
    }
    return {
      success: true,
      message: lang === "it" ? "Rete inserita con successo" : "Network inserted successfully"
    };
  }
  catch (err) {
    console.log(err)
    return {
      success: false,
      message: lang === "it" ? "Errore durante l'inserimento del network:" + err : "Error during network insertion: " + err
    }
  }
})

export const search = server$(async function (data) {
  console.log(data)
  try {
    const pathParts = new URL(this.request!.url).pathname.split('/');
    const sitoId = parseInt(pathParts[3]);
    console.log(sitoId)
    const query = await sql`
      SELECT *
      FROM rete
      INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete
      WHERE siti_rete.idsito=${sitoId}
      AND (rete.nomerete LIKE ${data.filter}
      OR rete.descrizione LIKE ${data.filter}
      OR rete.iprete LIKE ${data.filter})
    `;
    return query;
  } catch (e) {
    console.log(e);
    return [];
  }
})

export interface FilterObject {
  value?: string;
}

export default component$(() => {
  const txtQuickSearch = useSignal<HTMLInputElement | undefined>(undefined);
  const filter = useSignal<FilterObject>({ value: '' });
  const showPreview = useSignal(false);
  const loc = useLocation();
  const nav = useNavigate();
  const lang = getLocale("en");
  const site = useSignal<SiteModel>();
  const client = useSignal<ClienteModel>();
  const networks = useSignal<ReteModel[]>([]);
  const filteredNetworks = useSignal<ReteModel[]>([]);
  const city = useSignal<CittaModel>();

  const page = useSignal<string>("address");

  const insertAction = useInsertNetwork();
  const updateAction = useUpdateNetwork();
  const formData = useStore<ReteModel>({
    descrizione: "",
    idrete: 0,
    nomerete: "",
    vrf: 1,
    iprete: "",
    prefissorete: 0,
    vid: 1,
  });
  const broadcastIP = useSignal<string>("");
  const ipErrors = useSignal<string[]>([]);
  const ipCompleted = useSignal<boolean>(false);
  const attempted = useSignal<boolean>(false);
  const netMode = useSignal<number>(0);
  const vrfs = useSignal<VRFModel[]>([]);
  const vlans = useSignal<VLANModel[]>([]);

  const personalizedPrefix = useSignal<boolean>(false);

  const hasParent = useSignal<boolean>(false);
  const IPreteSup = useSignal<string>("");
  const reloadFN = useSignal<() => void | undefined>();

  const notifications = useSignal<Notification[]>([]);

  const updateAddr1 = useSignal<() => void>(() => { });
  const updateAddr2 = useSignal<() => void>(() => { });
  // const updateParents = useSignal<() => void>(() => { });



  useTask$(async () => {
    if (isNaN(parseInt(loc.params.site)) || isNaN(parseInt(loc.params.client))) {
      return;
    }



    try {
      vrfs.value = await getAllVRF();
      vlans.value = await getAllVLAN();
      site.value = await getSite(parseInt(loc.params.site));
      networks.value = await getAllNetworksBySite(parseInt(loc.params.site));
      city.value = await getCity(parseInt(loc.params.site));
      client.value = await getClient(parseInt(loc.params.client));
    } catch {
      console.log("Fetch error")
    }
  })


  useTask$(({ track }) => {
    track(() => formData.iprete);
    track(() => formData.prefissorete);
    track(() => networks.value);
    // console.log("re caloclo")
    filteredNetworks.value = networks.value.filter((x) => {
      if (!ipCompleted.value) return true;
      if (x.prefissorete >= formData.prefissorete) return false;

      const xIP = x.iprete.split(".");
      const formIP = formData.iprete.split(".");

      console.log(xIP, formIP);

      return (
        (x.prefissorete >= 24 && xIP[2] == formIP[2] && xIP[3] <= formIP[3]) ||
        (x.prefissorete >= 16 &&
          x.prefissorete < 24 &&
          xIP[1] == formIP[1] &&
          xIP[2] <= formIP[2]) ||
        (x.prefissorete >= 8 &&
          x.prefissorete < 16 &&
          xIP[0] == formIP[0] &&
          xIP[1] <= formIP[1]) ||
        (x.prefissorete < 8 && xIP[0] <= formIP[0])
      );
    });
  });

  const addNotification = $((message: string, type: "success" | "error" | "loading") => {
    notifications.value = [...notifications.value, { message, type }];
    if (type !== "loading") {
      setTimeout(() => {
        notifications.value = notifications.value.filter((n) => n.message !== message);
      }, 4000);
    }
  });

  const handleDelete = $(async (e: any) => {
    addNotification(lang === "en" ? "Deleting..." : "Eliminazione in corso...", "loading");
    if ((await deleteNetwork(e.idrete)).success) {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(
        lang === "en"
          ? "Record deleted successfully"
          : "Dato eliminato con successo",
        "success",
      );
    }
    else {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(
        lang === "en"
          ? "Error during deleting"
          : "Errore durante la eliminazione",
        "error",
      );
    }
    // console.log("COME?")
  });

  const handleModify = $((e: any) => {
    Object.assign(formData, e);
    hasParent.value = formData.idretesup != undefined;
    netMode.value = 2;
    personalizedPrefix.value = false;
    if (updateAddr1.value) updateAddr1.value();
  });

  const getReloader = $((e: () => void) => {
    reloadFN.value = e;
  });

  const handleRowClick = $((row: any) => {
    nav(
      loc.url.pathname.split("/").slice(0, 4).join("/") +
      "/" +
      row.idrete +
      "/info",
    );
  });


  const displayParent = $((row: any) => {
    const x = row as ReteModel;
    return `${x.iprete}/${x.prefissorete.toString()} - ${x.nomerete}`;
  });


  const handleNavClick = $((e: PointerEvent) => {
    page.value = (e.target as HTMLOptionElement).value.toString() || "address";
  });

  const prefixBox = useSignal<HTMLInputElement>();

  const t = inlineTranslate();

  const handleOk = $(async (data: any) => {
    addNotification(lang === "en" ? "Importing..." : "Importazione in corso...", 'loading');
    //console.log("handleOk",data)
    try {
      const result = await insertNetworkFromCSV(data)
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      if(result.success){
        addNotification(result.message, 'success');
        reloadFN.value?.()
      }else{
        addNotification(result.message, 'error');
      }
    }
    catch (err) {
      console.log(err)
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Error during import: " + err : "Errore durante l'importazione: " + err, 'error');
    }
  })

  const handleError = $((error: any) => {
    console.log(error);
    addNotification(lang === "en" ? "Error during import" : "Errore durante l'importazione", 'error');
  })

  const showPreviewCSV = $(() => {
    showPreview.value = true;
  });

  return (
    <>
      <div class="size-full overflow-hidden bg-white dark:bg-transparent">
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

        <Title
          haveReturn={true}
          url={loc.url.origin + "/" + lang + "/" + client.value?.idcliente}
        >
          {client.value?.nomecliente + " - " + site.value?.nomesito}
        </Title>
        {/* <nav class="w-full flex cursor-pointer mt-2 rounded-lg *:p-2 *:px-4 *:hover:bg-gray-100 *:bg-gray-50">
                  <option value="address" onClick$={handleNavClick}>Table</option>
                  <option value="info" onClick$={handleNavClick}>Info</option>
              </nav> */}
        <div class="animateEnter flex w-full justify-center">
          <nav class="mt-4 flex gap-1 rounded-xl bg-white dark:bg-gray-500 px-2 py-1 shadow sm:w-1/4">
            <button
              onClick$={handleNavClick}
              value="address"
              class="flex-1 rounded-lg border border-transparent px-4 py-2 font-medium text-gray-700 dark:bg-gray-500 dark:text-gray-100 transition hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200"
            // Aggiungi qui una condizione per la voce attiva, ad esempio:
            // class={isActive ? "bg-blue-200 text-blue-800" : "..."}
            >
              Table
            </button>
            <button
              onClick$={handleNavClick}
              value="info"
              class="flex-1 rounded-lg border border-transparent px-4 py-2 font-medium text-gray-700 dark:bg-gray-500 dark:text-gray-100 transition hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200"
            // Aggiungi qui una condizione per la voce attiva, ad esempio:
            // class={isActive ? "bg-blue-200 text-blue-800" : "..."}
            >
              Info
            </button>
          </nav>
        </div>

        {page.value == "address" && (
          <div class="animateEnter">
            <Table>
              <div class="mb-4 flex flex-col gap-2 rounded-t-xl border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800 bg-gray-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-lg font-semibold text-gray-800 dark:text-gray-200">{t("network.networks")}</span>
                  <BtnInfoTable showPreviewInfo={showPreviewCSV}></BtnInfoTable>
                </div>
                <div class="flex items-center gap-2">
                  <TextboxForm
                    id="txtfilter"
                    value={filter.value.value}
                    ref={txtQuickSearch}
                    placeholder={t("quicksearch")}
                    onInput$={(e) => {
                      filter.value.value = (e.target as HTMLInputElement).value;
                      if (reloadFN) reloadFN.value?.();
                    }}
                    search={true}
                  />
                </div>
              </div>
              <div class="flex flex-row items-center gap-2 mb-4 [&>*]:my-0 [&>*]:py-0">
                <ButtonAdd
                  nomePulsante={t("network.addnetwork")}
                  onClick$={() => {
                    Object.assign(formData, {
                      descrizione: "",
                      idrete: 0,
                      nomerete: "",
                      vrf: 1,
                      iprete: "",
                      prefissorete: 0,
                      vid: 1,
                      idretesup: null,
                    });
                    personalizedPrefix.value = false;
                    hasParent.value = false;
                    broadcastIP.value = "";
                    netMode.value = 1;
                    if (updateAddr2.value) updateAddr2.value();
                  }}
                ></ButtonAdd>
                <div>
                  <Import
                    OnError={handleError}
                    OnOk={handleOk}
                  ></Import>
                </div>
              </div>
              <Dati_Headers
                DBTabella="rete"
                dati={networks.value}
                nomeTabella={lang == "en" ? "networks" : "reti"}
                onReloadRef={getReloader}
                funcReloadData={reloadData}
                OnModify={handleModify}
                OnDelete={handleDelete}
                onRowClick={handleRowClick}
              />
            </Table>
          </div>
        )}
        {page.value == "info" && (
          <div class="mt-8 flex flex-col gap-8 md:flex-row mx-8 md:mx-0 animateEnter">
            <div class="inline-flex flex-1 flex-col items-start dark:bg-gray-800 dark:border-neutral-700 dark:text-gray-100 dark:**:text-gray-100 dark:**:border-gray-600 justify-start gap-1 rounded-md border-1 border-gray-300 px-5 py-3">
              <div class="flex h-[50px] w-full items-center overflow-hidden">
                <div class="text-lg font-semibold text-black">{t("site.siteinformation")}</div>
              </div>
              <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                <div class="justify-start text-lg font-normal text-black">{t("site.name")}</div>
                <div class="justify-start text-lg font-normal text-black">
                  {site.value?.nomesito}
                </div>
              </div>
              <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                <div class="justify-start text-lg font-normal text-black">{t("site.position")}</div>
                <div class="justify-start text-lg font-normal text-black">
                  {city.value?.nomecitta}
                </div>
              </div>
              <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                <div class="justify-start text-lg font-normal text-black">{t("network.networks")}</div>
                <div class="justify-start text-lg font-normal text-black">
                  {networks.value.length}
                </div>
              </div>
            </div>

            <div class="mx-auto flex-initial rounded-md border-1 border-[#cdcdcd] dark:bg-gray-800 dark:border-neutral-700 dark:text-gray-100 dark:**:text-gray-100  dark:**:border-gray-600 max-md:w-60">
              <div class="flex flex-1 *:cursor-pointer flex-col dark:*:border-gray-600 *:p-3 *:px-10">
                <div class="flex flex-1 border-b border-[#f3f3f3]">
                  <div class="w-full text-center font-['Inter'] text-base font-semibold text-black cursor-default">{t("site.views")}</div>
                </div>
                <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  onClick$={() => nav("0/addresses/view")}
                >
                  {t("ipaddresses")}
                </button>
                <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  onClick$={() => nav("0/intervals/view")}
                >
                  {t("ipintervals")}
                </button>
                {/* <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 text-left"
                  onClick$={() => nav("0/prefixes/view")}
                >
                  {t("prefixes")}
                </button> */}
                <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  onClick$={() => nav("0/aggregates/view")}
                >
                  {t("network.aggregates.aggregate")}
                </button>
                <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                  onClick$={() => nav("0/vlan/view")}
                >
                  VLAN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <PopupModal
        visible={netMode.value != 0}
        title={
          netMode.value == 1
            ? t("network.addnetwork")
            : t("network.updatenetwork")
        }
        onClosing$={() => {
          netMode.value = 0;
        }}
      >
        <Form
          onSubmit$={async () => {
            if (netMode.value == 1) {
              await insertAction.submit({
                descrizione: formData.descrizione,
                nomerete: formData.nomerete,
                vrf: formData.vrf,
                iprete: formData.iprete,
                vid: formData.vid ?? 1,
                prefissorete: formData.prefissorete,
                idretesup: formData.idretesup,
              });
              if (insertAction.value?.success) {
                netMode.value = 0;
                reloadFN.value?.();
                addNotification("Network added successfully", "success");
              } else {
                // console.log(insertAction.value?.message);
                addNotification("Error during creation", "error");
              }
            } else if (netMode.value == 2) {
              await updateAction.submit({
                descrizione: formData.descrizione,
                nomerete: formData.nomerete,
                vrf: formData.vrf,
                iprete: formData.iprete,
                vid: formData.vid ?? 1,
                prefissorete: formData.prefissorete,
                idretesup: formData.idretesup,
                idrete: formData.idrete,
              });
              if (updateAction.value?.success) {
                netMode.value = 0;
                reloadFN.value?.();
                addNotification("Network updated successfully", "success");
              } else {
                // console.log(updateAction.value?.message);
                addNotification("Error during update", "error");
              }
            }
          }}
        >
          <div class="**:flex-1">
            <TextboxForm
              id="txtName"
              title={t("network.name")}
              value={formData.nomerete}
              placeholder={t("network.networkname")}
              onInput$={(e) => {
                formData.nomerete = (e.target as any).value;
              }}
            />
          </div>
          <div>
            <h3 class="font-semibold">{t("description")}</h3>
            <textarea
              value={formData.descrizione}
              id="descrizione"
              class="w-full rounded-md border border-gray-300 p-2 outline-0 focus:border-black"
              placeholder={t("network.insertdescription")}
              onInput$={(e) =>
                (formData.descrizione = (e.target as HTMLTextAreaElement).value)
              }
            ></textarea>
          </div>
          <div class="w-full justify-between **:flex-1">
            <AddressBox
              addressType="network"
              currentID={formData.idrete}
              title={t("network.ipnetwork")}
              value={formData.iprete}
              currentIPNetwork={formData.idretesup}
              prefix={formData.prefissorete.toString()}
              forceUpdate$={(e) => (updateAddr1.value = e)}
              siteID={parseInt(loc.params.site)}
              OnInput$={(e) => {
                ipErrors.value = e.errors;
                ipCompleted.value = e.complete;

                if (e.complete) {
                  if (formData.prefissorete == 0)
                    formData.prefissorete = parseInt(e.class);
                  broadcastIP.value = e.last;
                  updateAddr2.value();

                  if (netMode.value == 2 && !e.exists)
                    e.errors.push(
                      lang == "en"
                        ? "The IP does not exists in current network."
                        : "L'indirizzo IP non esiste in questa rete.",
                    );
                  else if (netMode.value == 1 && e.exists)
                    e.errors.push(
                      lang == "en"
                        ? "This IP already exists."
                        : "Questo IP esiste già",
                    );

                  formData.iprete = e.ip;
                }

                networks.value = [...networks.value];

                attempted.value = e.complete;
              }}
            ></AddressBox>
            {attempted.value &&
              ipErrors.value.length > 0 &&
              ipErrors.value.map((x) => (
                <p class="w-full text-end text-red-500 mb-2" key={x}>{x}</p>
              ))}
            <AddressBox
              title={t("network.broadcastip")}
              forceUpdate$={(e) => (updateAddr2.value = e)}
              disabled={true}
              value={broadcastIP.value}
            ></AddressBox>
          </div>
          <div class="**:flex-1">
            <TextboxForm
              id="txtPrefix"
              value={
                formData.prefissorete == 0 || personalizedPrefix.value
                  ? prefixBox.value?.value
                  : formData.prefissorete.toString()
              }
              title={t("network.prefix")}
              ref={prefixBox}
              placeholder="Es. 24"
              onInput$={(e) => {
                formData.prefissorete = (e.target as any).value;
                personalizedPrefix.value = true;
                updateAddr1.value();
              }}
            />
            {personalizedPrefix.value &&
              (formData.prefissorete < 1 || formData.prefissorete > 31) && (
                <span class="text-red-600">{t("network.invalidprefix")}</span>
              )}
          </div>
          <SelectForm
            id="cmbVLAN"
            title="VLAN"
            name="VLAN"
            value={formData.vid?.toString() || ""}
            OnClick$={(e) => {
              // console.log((e.target as HTMLOptionElement).value);
              formData.vid = parseInt((e.target as HTMLOptionElement).value);
            }}
            listName=""
          >
            {vlans.value.map((x: VLANModel) => (
              <option key={x.vid} about={x.descrizionevlan} value={x.vid}>
                {x.nomevlan}
              </option>
            ))}
          </SelectForm>
          {attempted.value && !formData.vid && (
            <span class="text-red-600">{t("network.selectVLAN")}</span>
          )}
          <SelectForm
            id="txtVRF"
            name="vrf"
            value={formData.vrf?.toString() || ""}
            title="VRF"
            OnClick$={(e) => {
              formData.vrf = parseInt((e.target as HTMLOptionElement).value);
            }}
          >
            {vrfs.value.length > 0 &&
              vrfs.value.map((x) => (
                <option key={x.idvrf} value={x.idvrf} about={x.descrizionevrf}>
                  {x.nomevrf}
                </option>
              ))}
          </SelectForm>
          {insertAction.submitted && (
            <p>{insertAction.value?.fieldErrors?.vid}</p>
          )}
          {insertAction.submitted && <p>{insertAction.value?.formErrors}</p>}
          <div class="flex">
            <div class="flex items-center justify-center">
              <CHKForms
                id=""
                name=""
                value={formData.idretesup != undefined}
                nameCHK={t("network.subnet")}
                setValue={hasParent}
              ></CHKForms>
            </div>
          </div>
          {hasParent.value && (
            <div class="flex w-full flex-col items-center justify-center border border-gray-200 *:block">
              {/* <SelectForm id="" value={formData.idretesup?.toString() ?? ""} name="" title={$localize`Rete Container`} OnClick$={(e) => { formData.idretesup = parseInt((e.target as HTMLOptionElement).value); IPreteSup.value = (e.target as HTMLOptionElement).innerText }}>
                              {filteredNetworks.value.length!=0 && filteredNetworks.value.map(x => (
                                  <option value={x.idrete} about={x.descrizione}>
                                      {`${x.iprete}/${x.prefissorete.toString()} - ${x.nomerete}`}
                                  </option>
                              ))}
                          </SelectForm> */}
              <SelectFormLive
                data={filteredNetworks.value}
                valueMember="idrete"
                displayMember={displayParent}
                id=""
                value={formData.idretesup?.toString() ?? ""}
                name=""
                title={t("network.networkcontainer")}
                OnClick$={(e) => {
                  formData.idretesup = parseInt(
                    (e.target as HTMLOptionElement).value,
                  );
                  IPreteSup.value = (e.target as HTMLOptionElement).innerText;
                }}
              />
            </div>
          )}
          <div class="flex w-full justify-end">
            <input
              type="submit"
              class="w-1/2 cursor-pointer rounded-md bg-black p-2 text-white hover:bg-gray-900 active:bg-gray-800 disabled:cursor-default disabled:bg-gray-600"
              value={t("confirm")}
              disabled={
                formData.descrizione == "" ||
                !ipCompleted.value ||
                formData.nomerete == "" ||
                !(formData.prefissorete > 0 && formData.prefissorete < 32) ||
                ipErrors.value.length > 0 ||
                (!formData.idretesup && hasParent.value)
              }
            />
          </div>
        </Form>
      </PopupModal>

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
        <TableInfoCSV tableName="rete"></TableInfoCSV>
      </PopupModal>
    </>
  );
});
