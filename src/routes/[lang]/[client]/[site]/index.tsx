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
import SelectForm from "~/components/form/formComponents/SelectForm";
import CHKForms from "~/components/form/formComponents/CHKForms";
import SelectFormLive from "~/components/form/formComponents/SelectFormLive";
import { inlineTranslate } from "qwik-speak";

type Notification = {
  message: string;
  type: "success" | "error";
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

export default component$(() => {

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

  const addNotification = $((message: string, type: "success" | "error") => {
    notifications.value = [...notifications.value, { message, type }];
    // Rimuovi la notifica dopo 3 secondi
    setTimeout(() => {
      notifications.value = notifications.value.filter(
        (n) => n.message !== message,
      );
    }, 3000);
  });

  const handleDelete = $(async (e: any) => {
    if ((await deleteNetwork(e.idrete)).success)
      addNotification(
        lang === "en"
          ? "Record deleted successfully"
          : "Dato eliminato con successo",
        "success",
      );
    else
      addNotification(
        lang === "en"
          ? "Error during deleting"
          : "Errore durante la eliminazione",
        "error",
      );
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

  return (
    <>
      <div class="size-full overflow-hidden bg-white">
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
          <nav class="mt-4 flex gap-1 rounded-xl bg-white px-2 py-1 shadow sm:w-1/4">
            <button
              onClick$={handleNavClick}
              value="address"
              class="flex-1 rounded-lg border border-transparent px-4 py-2 font-medium text-gray-700 transition hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200"
            // Aggiungi qui una condizione per la voce attiva, ad esempio:
            // class={isActive ? "bg-blue-200 text-blue-800" : "..."}
            >
              Table
            </button>
            <button
              onClick$={handleNavClick}
              value="info"
              class="flex-1 rounded-lg border border-transparent px-4 py-2 font-medium text-gray-700 transition hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200"
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
              <div class="mb-4 flex flex-col gap-2 rounded-t-xl border-b border-gray-200 bg-gray-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-lg font-semibold text-gray-800">{t("network.networks")}</span>
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
            </Table>
          </div>
        )}
        {page.value == "info" && (
          <div class="mt-8 flex flex-col gap-8 md:flex-row mx-8 md:mx-0">
            <div class="inline-flex flex-1 flex-col items-start justify-start gap-1 rounded-md border-1 border-gray-300 px-5 py-3">
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

            <div class="mx-auto flex-initial rounded-md border-1 border-[#cdcdcd] max-md:w-60">
              <div class="flex flex-1 cursor-pointer flex-col *:p-3 *:px-10">
                <div class="flex flex-1 border-b border-[#f3f3f3]">
                  <div class="w-full text-center font-['Inter'] text-base font-semibold text-black">{t("site.views")}</div>
                </div>
                <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 text-left"
                  onClick$={() => nav("0/addresses/view")}
                >
                  {t("ipaddresses")}
                </button>
                <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 text-left"
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
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 text-left"
                  onClick$={() => nav("0/aggregates/view")}
                >
                  {t("network.aggregates.aggregate")}
                </button>
                <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 text-left"
                  onClick$={() => nav("0/vfr/view")}
                >
                  VFR
                </button>
                <button
                  type="button"
                  class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 text-left"
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
                <p class="w-full text-end text-red-500" key={x}>{x}</p>
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
    </>
  );
});
