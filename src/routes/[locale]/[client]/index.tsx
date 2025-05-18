import {
  $,
  component$,
  getLocale,
  useSignal,
  useStore,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import {
  Form,
  routeAction$,
  server$,
  useLocation,
  z,
  zod$,
} from "@builder.io/qwik-city";
import sql from "~/../db";
import Title from "~/components/layout/Title";
import TextboxForm from "~/components/forms/formsComponents/TextboxForm";
import {
  CittaModel,
  ClienteModel,
  PaeseModel,
  ReteModel,
  SiteModel,
} from "~/dbModels";
import Accordion from "~/components/layout/Accordion/Accordion";
import PopupModal from "~/components/ui/PopupModal";
import SelectTextboxForm from "~/components/forms/formsComponents/SelectTextboxForm";
import CHKForms from "~/components/forms/formsComponents/CHKForms";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import ConfirmDialog from "~/components/ui/confirmDialog";
import { isUserClient } from "~/fnUtils";

type Notification = {
  message: string;
  type: "success" | "error";
};

type fmData = SiteModel & { nomecitta: string; nomepaese: string };

export const getCitiesOfClients = server$(async function (idcliente: number) {
  try {
    if (isNaN(idcliente))
        throw new Error("idcliente non trovato");
    const query =
      await sql`SELECT DISTINCT citta.* FROM citta INNER JOIN siti ON citta.idcitta=siti.idcitta WHERE siti.idcliente=${idcliente}`;
    return query as unknown as CittaModel[];
  } catch (e) {
    console.log(e);
  }

  return [];
});

export const getClient = server$(async function (idclient: number) {
  let client: ClienteModel = {
    idcliente: -1,
    nomecliente: "",
    telefonocliente: "",
  };
  try {
    if (isNaN(idclient))
        throw new Error("idcliente non trovato");
    const query =
      await sql`SELECT * FROM clienti WHERE clienti.idcliente=${idclient}`;
    client = query[0] as ClienteModel;
  } catch (e) {
    console.log(e);
  }

  return client;
});

export const getCitiesHints = server$(async function () {
  try {
    const data = await sql`SELECT * FROM citta`;
    return data.map((x) => ({ text: x.nomecitta, value: x.idcitta }));
  } catch (e) {
    console.log(e);
    return [];
  }
});

export const deleteSite = server$(async function (idsito: number) {
  try {
    if (isNaN(idsito))
        throw new Error("idsito non trovato");
    const data = await sql`DELETE FROM siti WHERE idsito=${idsito}`;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
});

export const getAllCountries = server$(async () => {
  try {
    const data = await sql`SELECT * FROM paesi ORDER BY nomepaese`;
    return data as unknown as PaeseModel[];
  } catch (e) {
    console.log(e);
    return [];
  }
});

export const getClientCountries = server$(async (idcliente: number) => {
  try {
    if (isNaN(idcliente))
        throw new Error("idcliente non trovato");
    const data =
      await sql`SELECT DISTINCT paesi.* FROM paesi INNER JOIN citta ON paesi.idpaese=citta.idpaese INNER JOIN siti ON citta.idcitta=siti.idcitta WHERE siti.idcliente=${idcliente} ORDER BY nomepaese`;
    return data as unknown as PaeseModel[];
  } catch (e) {
    console.log(e);
    return [];
  }
});

export const getSitesByCity = server$(
  async (idcitta: string, idcliente: number) => {
    try {
      if (isNaN(parseInt(idcitta)))
        throw new Error("idcitta non trovato");
      if (isNaN(idcliente))
        throw new Error("idcliente non trovato");
      const data =
        await sql`SELECT * FROM siti WHERE idcitta = ${idcitta} AND idcliente = ${idcliente}`;
      // console.log(idcitta);
      return data as unknown as SiteModel[];
    } catch (e) {
      console.log(e);
      return [];
    }
  },
);

export const getCityCountry = server$(async (idcitta: number) => {
  try {
    if (isNaN(idcitta))
      throw new Error("idcitta non trovato");
    const data =
      await sql`SELECT * FROM citta INNER JOIN paesi ON citta.idpaese=paesi.idpaese WHERE idcitta = ${idcitta}`;
    // console.log(idcitta);
    return data as unknown as (CittaModel & PaeseModel)[];
  } catch (e) {
    return [];
  }
});

export const cleanCities = server$(async () => {
  try {
    await sql`DELETE FROM citta WHERE citta.idcitta NOT IN (SELECT siti.idcitta FROM siti)`;
  } catch (e) {
    console.log(e);
  }
});

export const useCreateSite = routeAction$(
  async (data) => {
    try {
      if (data.idcitta == "") {
        const rows =
          await sql`SELECT idcitta FROM citta WHERE nomecitta=${data.nomecitta} AND idpaese=${data.idpaese}`;
        if (rows.length > 0) {
          data.idcitta = rows[0].idcitta;
        } else {
          await sql`INSERT INTO citta(nomecitta,idpaese) VALUES (${data.nomecitta.toLowerCase()},${data.idpaese})`;
          data.idcitta = (
            await sql`SELECT idcitta FROM citta ORDER BY idcitta DESC LIMIT 1`
          )[0].idcitta;
        }
      }

      await sql`INSERT INTO siti(nomesito,idcitta,datacenter,tipologia,idcliente) VALUES (${data.nomesito},${parseInt(data.idcitta)},${data.datacenter == "on"},
                    ${data.tipologia},${parseInt(data.idcliente)})`;
      return { success: true, site: data };
    } catch (e) {
      console.log(e);
      return { success: false, site: {} };
    }
  },
  zod$({
    nomesito: z.string().min(2),
    idcitta: z.string(),
    datacenter: z.string().optional(),
    tipologia: z.string(),
    idcliente: z.string().min(1),
    nomecitta: z.string().min(2),
    idpaese: z.string()
  }),
);

export const useUpdateSite = routeAction$(
  async (data) => {
    try {
      if (data.idcitta == "") {
        if (data.nomecitta.toLowerCase() != "" && data.idpaese != "") {
          await sql`INSERT INTO citta(nomecitta,idpaese) VALUES (${data.nomecitta.toLowerCase()},${data.idpaese})`;
          data.idcitta = (
            await sql`SELECT idcitta FROM citta ORDER BY idcitta DESC LIMIT 1`
          )[0].idcitta;
        } else {
          throw new Error("Nome citta non valido");
        }
      } else {
        const results =
          await sql`SELECT * FROM citta WHERE citta.idcitta=${data.idcitta}`;

        if (results.length > 0 && results[0].idpaese != data.idpaese) {
          await sql`INSERT INTO citta(nomecitta,idpaese) VALUES (${results[0].nomecitta.toLowerCase()},${data.idpaese})`;
        }
        if (data.idpaese != "")
          data.idcitta = (
            await sql`SELECT idcitta FROM citta WHERE citta.nomecitta=${results[0].nomecitta.toLowerCase()} AND citta.idpaese=${data.idpaese}`
          )[0].idcitta;
      }

      await sql`UPDATE siti SET nomesito=${data.nomesito}, idcitta=${data.idcitta}, datacenter=${data.datacenter == "on"}, tipologia=${data.tipologia} WHERE idsito=${parseInt(data.idsito)}`;
      cleanCities();
      return { success: true, site: data };
    } catch (e) {
      console.log(e);
      return { success: false, site: {} };
    }
  },
  zod$({
    idsito: z.string(),
    nomesito: z.string().min(2),
    idcitta: z.string(),
    datacenter: z.string().optional(),
    tipologia: z.string(),
    idcliente: z.string().min(1),
    nomecitta: z.string().min(2),
    idpaese: z.string(),
  }),
);

export default component$(() => {
  const createSite = useCreateSite();
  const updateSite = useUpdateSite();
  const loc = useLocation();
  const lang = getLocale("en");

  const sites = useSignal<SiteModel[]>([]);
  const selected = useSignal<number>(-1);
  const client = useSignal<ClienteModel>();
  const countries = useSignal<PaeseModel[]>();
  const clientCountries = useSignal<PaeseModel[]>();
  const selectedCountry = useSignal<string>("");
  const cities = useSignal<CittaModel[]>();
  const citiesHints = useSignal<{ text: string; value: any }[]>();
  const updateTable = useSignal<boolean>(false);

  const siteUpdateMode = useSignal<boolean>(false);
  const siteAddMode = useSignal<number>(0);



  const selectedSite = useStore<fmData>({
    datacenter: false,
    idcitta: 0,
    idsito: 0,
    nomesito: "",
    tipologia: "",
    nomecitta: "",
    nomepaese: "",

  });

  const isDatacenter = useSignal(false);
  const notifications = useSignal<Notification[]>([]);
  const showDialog = useSignal(false);

  const isClient = useSignal(false);
  const cityName = useSignal("");

  const isSearching = useSignal(false);

  useTask$(async () => {
    countries.value = await getAllCountries();
    client.value = await getClient(parseInt(loc.params.client));
    isClient.value = await isUserClient();
  });

  useVisibleTask$(async ({ track, cleanup }) => {
    track(() => updateTable.value);
    let tm = setTimeout(() => {
      document.getElementById("btn" + selected.value)?.focus();
    }, 300);

    cleanup(() => tm);
  });

  useTask$(async ({ track }) => {
    track(() => updateTable.value);
    cities.value = await getCitiesOfClients(parseInt(loc.params.client));
    citiesHints.value = await getCitiesHints();
    clientCountries.value = await getClientCountries(
      parseInt(loc.params.client),
    );
  });

  useTask$(async ({ track }) => {
    track(() => updateTable.value);
    track(() => selected.value);
    sites.value = await getSitesByCity(
      selected.value.toString(),
      parseInt(loc.params.client),
    );
  });

  const handleSiteClick = $(() => {
    if (siteUpdateMode.value) {
      siteUpdateMode.value = false;
      siteAddMode.value = 0;
    } else siteUpdateMode.value = true;
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

  const handleSubmit = $(async () => {
    if (siteAddMode.value == 1) {
      if (createSite.value?.failed) {
        return;
      }
      if (createSite.value?.success) {
        addNotification(
          lang == "en"
            ? "Creation successful"
            : "Creazione avvenuta con successo",
          "success",
        );
        // @ts-ignore
        selected.value = (createSite.value.site as fmData).idcitta;
        // @ts-ignore
        cityName.value = (createSite.value.site as fmData).nomecitta;
      } else
        addNotification(
          lang == "en"
            ? "Error during creation"
            : "Errore durante la creazione",
          "error",
        );
    } else {
      if (updateSite.value?.failed) {
        return;
      }
      if (updateSite.value?.success) {
        addNotification(
          lang == "en" ? "Update successful" : "Modifica avvenuta con successo",
          "success",
        );
        // @ts-ignore
        selected.value = (updateSite.value.site as fmData).idcitta;
        // @ts-ignore
        cityName.value = (updateSite.value.site as fmData).nomecitta;
      } else
        addNotification(
          lang == "en" ? "Error during update" : "Errore durante la modifica",
          "error",
        );
    }

    siteAddMode.value = 0;
    clientCountries.value = []; // force reload

    cities.value = [];
    updateTable.value = !updateTable.value;
  });

  const confirmDelete = $(async () => {
    if (await deleteSite(selectedSite.idsito))
      addNotification(
        lang == "en"
          ? "Deleted successful"
          : "Eliminazione avvenuta con successo",
        "success",
      );
    else
      addNotification(
        lang == "en"
          ? "Error during deletion"
          : "Errore durante l'eliminazione",
        "error",
      );
    showDialog.value = false;
    selected.value = -1;
    cleanCities().then(() => {
      window.location.reload();
    });
  });

  const cancelDelete = $(() => {
    showDialog.value = false;
  });

  const seeLocMobile = useSignal(true);
  const seeSiteMobile = useSignal(true);

  return (
    <>
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
      <Title haveReturn={!isClient.value} url={loc.url.origin}>
        {client.value?.nomecliente}
      </Title>
      <br />
      {/* VISUALIZZAZIONE DELLE CITTA E PAESI */}
      <div class="flex flex-col gap-2 md:flex-row">
        <div class="mx-5 flex flex-col rounded-md border border-gray-200 p-2 shadow md:h-[60vh] md:w-1/4 md:p-3">
          <div
            class="ms-1 flex items-center gap-2"
            onClick$={() => {
              console.log(window.innerWidth);
              if (window.innerWidth < 768)
                seeLocMobile.value = !seeLocMobile.value;
            }}
          >
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
                d="m6.115 5.19.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64"
              />
            </svg>
            <p class="flex w-full justify-between py-2 pe-2 text-sm font-medium">
              {$localize`Location`}
              <button
                onClick$={() => (siteAddMode.value = 1)}
                class="has-tooltip rounded-lg p-0.5 hover:bg-gray-200 active:bg-gray-100"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="size-4 cursor-pointer"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span class="tooltip">{$localize`Aggiungi sito`}</span>
              </button>
            </p>
          </div>
          <hr class="text-gray-300 transition-all duration-400 linear" style={{ opacity: seeLocMobile.value ? 1 : 0 }} />
          <div
            class="space-y-1 transition-all duration-400 linear max-md:max-h-[500px]"
            style={{
              maxHeight: seeLocMobile.value ? "" : 0,
              overflowY: seeLocMobile.value ? "auto" : "hidden",
            }}
          >
            {cities.value &&
              clientCountries.value &&
              cities.value?.length > 0 ? (
              clientCountries.value.map((x: PaeseModel) => {
                const filterCity = cities.value?.filter(
                  (j) => x.idpaese == j.idpaese,
                );
                if (filterCity?.length == 0) return;
                return (
                  <Accordion
                    title={x.nomepaese}
                    isVisible={
                      filterCity?.find((x) => x.idcitta == selected.value) !=
                      undefined
                    }
                  >
                    {filterCity?.map((j) => (
                      <button
                        id={"btn" + j.idcitta}
                        class="w-full cursor-pointer rounded-md px-3 py-0.5 text-start outline-0 hover:bg-gray-50 focus:bg-gray-100"
                        onClick$={() => {
                          selected.value = j.idcitta;
                          cityName.value = j.nomecitta;
                        }}
                        key={j.idcitta}
                      >
                        {j.nomecitta[0].toUpperCase() +
                          j.nomecitta.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </Accordion>
                );
              })
            ) : (
              <div class="h-full text-center text-sm text-gray-400">
                {$localize`Non ci sono paesi con almeno un sito`}
              </div>
            )}
          </div>
        </div>
        <div class="mx-5 flex flex-col rounded-md border border-gray-200 p-3 shadow md:h-[60vh] md:w-3/4">
          <div
            class="ms-1 flex items-center gap-2"
            onClick$={() => {
              if (window.innerWidth < 768)
                seeSiteMobile.value = !seeSiteMobile.value;
            }}
          >
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
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
              />
            </svg>

            <p class="flex w-full items-center justify-between py-2 text-sm font-medium">
              {$localize`All Sites`}
              {selected.value !== -1 ? ": " + sites.value.length : ""}
              {!isClient.value && selected.value !== -1 && (
                <button
                  onClick$={handleSiteClick}
                  class="has-tooltip cursor-pointer rounded-[50%] p-1 hover:bg-gray-200"
                  style={{
                    backgroundColor: siteUpdateMode.value ? "#ddd" : "",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="size-4"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                    />
                  </svg>
                  <span class="tooltip">{$localize`Edit`}</span>
                </button>
              )}
            </p>
          </div>
          <hr class="text-gray-300 transition-all duration-400 linear" style={{ opacity: seeSiteMobile.value ? 1 : 0 }} />
          <div
            class="h-full transition-all max-sm:max-h-[500px] duration-400 linear"
            style={{
              maxHeight: seeSiteMobile.value ? "" : 0,
              overflowY: seeSiteMobile.value ? "hidden" : "auto",
            }}
          >
            {selected.value !== -1 ? (
              <div class="h-full space-y-1 overflow-x-hidden">
                <span class="ms-1 text-sm text-gray-400">
                  {cityName.value[0].toUpperCase() +
                    cityName.value.slice(1).toLowerCase()}
                </span>
                <br />
                {sites.value.length > 0 ? (
                  sites.value.map((x: SiteModel) => (
                    <div class="mx-2 flex items-center justify-between">
                      <a
                        href={`${x.idsito}/`}
                        class="flex items-center gap-3 text-sm text-blue-600 hover:underline"
                      >
                        {x.datacenter && x.tipologia == "active" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5 text-gray-700"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                            />
                          </svg>
                        )}
                        {x.datacenter && x.tipologia == "standby" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5 text-gray-700"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z"
                            />
                          </svg>
                        )}
                        {x.datacenter && x.tipologia == "disaster_recovery" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5 text-gray-700"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
                            />
                          </svg>
                        )}
                        {!x.datacenter && x.tipologia == "filiale" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5 text-gray-700"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
                            />
                          </svg>
                        )}
                        {x.tipologia == "none" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-5 text-gray-700"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                            />
                          </svg>
                        )}
                        {x.nomesito}
                      </a>
                      <div>
                        {siteUpdateMode.value && (
                          <>
                            <button
                              class="has-tooltip inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-amber-500 transition-colors hover:bg-amber-600"
                              onClick$={async () => {
                                Object.assign(selectedSite, x);
                                const cityCountry = (
                                  await getCityCountry(x.idcitta)
                                )[0];
                                selectedSite.idcitta = cityCountry.idcitta;
                                selectedSite.nomecitta = cityCountry.nomecitta;
                                selectedCountry.value =
                                  cityCountry.idpaese.toString();
                                isDatacenter.value = x.datacenter;
                                siteAddMode.value = 2;
                              }}
                            >
                              <span class="tooltip">{$localize`Modifica`}</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="white"
                                class="h-5 w-5"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
                            </button>
                            <button
                              class={`has-tooltip relative ml-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-red-500 transition-colors hover:bg-red-600`}
                              onClick$={() => {
                                showDialog.value = true;
                                selectedSite.idsito = x.idsito;
                              }}
                            >
                              <span class="tooltip">{$localize`Elimina`}</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="white"
                                class="h-5 w-5"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div class="mb-5 flex h-full w-full flex-col items-center justify-center text-gray-400">
                    <p>{$localize`Non sono presenti siti.`}</p>
                    <p>
                      {$localize`Utilizza il pulsante modifica per aggiungerne.`}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              !siteUpdateMode.value && (
                <div class="mt-3 mb-3 flex h-full w-full items-center justify-center text-gray-400">
                  {$localize`Seleziona una città nel menù a sinistra`}
                </div>
              )
            )}
          </div>
          {/* {
                        siteUpdateMode.value &&
                        (
                            <div class="w-full mt-2 flex justify-center">
                                <button onClick$={() => siteAddMode.value = 1} class="bg-black hover:bg-gray-900 active:bg-gray-700 text-white cursor-pointer p-2 px-4 rounded-sm text-sm">Aggiungi sito</button>
                            </div>
                        )
                    } */}
        </div>
      </div>

      {/* Dialog di conferma eliminazione */}
      <ConfirmDialog
        isOpen={showDialog.value}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        title={$localize`Conferma`}
        message={$localize`Sei sicuro di voler procedere?`}
        confirmText={$localize`Elimina`}
        cancelText={$localize`Annulla`}
      />

      <PopupModal
        visible={siteAddMode.value > 0}
        onClosing$={() => (siteAddMode.value = 0)}
        title={siteAddMode.value == 1 ? "Aggiungi sito" : "Modifica sito"}
      >
        <Form
          action={siteAddMode.value == 1 ? createSite : updateSite}
          onSubmit$={handleSubmit}
        >
          <TextboxForm
            id="txtNomeSito"
            nameT="nomesito"
            value={selectedSite.nomesito}
            placeholder="Nome del sito"
            title="Nome sito:"
          />
          {siteAddMode.value == 1
            ? createSite.value?.failed &&
            createSite.value?.fieldErrors?.nomesito && (
              <div class="ms-2 text-sm text-red-600">
                {createSite.value?.fieldErrors?.nomesito}
              </div>
            )
            : updateSite.value?.failed &&
            updateSite.value?.fieldErrors?.nomesito && (
              <div class="ms-2 text-sm text-red-600">
                {updateSite.value?.fieldErrors?.nomesito}
              </div>
            )}
          <input
            type="hidden"
            name="idsito"
            value={selectedSite.idsito}
            required
          />
          <input
            type="hidden"
            name="idcitta"
            value={selectedSite.idcitta}
            required
          />
          <input type="hidden" name="idpaese" value="-1" required />
          <input
            type="hidden"
            name="nomecitta"
            value={selectedSite.nomecitta}
          />
          <div class="flex flex-col md:flex-row">
            <SelectTextboxForm
              id="txtCitta"
              title="Città:"
              value={selectedSite.nomecitta}
              OnSelectedValue$={async (e) => {
                const input = document.getElementsByName(
                  "idcitta",
                )[0] as HTMLInputElement;
                input.value = e.value;
                console.log(e.value);
                const input2 = document.getElementsByName(
                  "nomecitta",
                )[0] as HTMLInputElement;
                input2.value = e.text;
                if (e.value != "") {
                  if (isSearching.value) {
                    isSearching.value = true;
                    setTimeout(async () => {
                      selectedCountry.value = await server$(async () => {
                        return (
                          await sql`SELECT idpaese FROM citta WHERE idcitta = ${e.value}`
                        )[0].idpaese.toString();
                      })();
                      isSearching.value = false;
                    }, 1000);
                  }
                }
              }}
              OnInput$={(e) => {
                const input = document.getElementsByName(
                  "nomecitta",
                )[0] as HTMLInputElement;
                input.value = e.target.value;
                const input1 = document.getElementsByName(
                  "idcitta",
                )[0] as HTMLInputElement;
                input1.value = "";
              }}
              name="nomecitta"
              values={citiesHints.value}
            />
            {createSite.value?.failed &&
              createSite.value?.fieldErrors?.nomecitta && (
                <div class="ms-2 text-sm text-red-600">
                  {createSite.value?.fieldErrors?.nomecitta}
                </div>
              )}
            {updateSite.value?.failed &&
              updateSite.value?.fieldErrors?.nomecitta && (
                <div class="ms-2 text-sm text-red-600">
                  {updateSite.value?.fieldErrors?.nomecitta}
                </div>
              )}
            <SelectForm
              id="cmbPaese"
              title="Paese: "
              value={selectedCountry.value}
              name="nomepaese"
              OnClick$={(e) => {
                (
                  document.getElementsByName("idpaese")[0] as HTMLInputElement
                ).value = (e.target as HTMLOptionElement).value;
              }}
            >
              {countries.value?.map((x) => {
                const renderedText =
                  x.nomepaese.length > 16
                    ? x.nomepaese.substring(0, 17) + "..."
                    : x.nomepaese;
                return <option value={x.idpaese}>{renderedText}</option>;
              })}
            </SelectForm>
          </div>

          <CHKForms
            name="datacenter"
            id="Datacenter"
            nameCHK="Datacenter: "
            setValue={isDatacenter}
            value={selectedSite.datacenter}
          />
          <input type="text" class="hidden" name="tipologia" />
          <SelectForm
            id="cmbTipo"
            name=""
            value={isDatacenter.value ? "active" : "none"}
            title="Tipologia: "
            OnClick$={(e) => {
              (
                document.getElementsByName("tipologia")[0] as HTMLInputElement
              ).value = (e.target as HTMLOptionElement).value;
            }}
          >
            {isDatacenter.value ? (
              <>
                <option value="active">Attivo</option>
                <option value="standby">Standby</option>
                <option value="disaster_recovery">Disaster Recovery</option>
              </>
            ) : (
              <>
                <option value="none">-</option>
                <option value="filiale">Filiale</option>
              </>
            )}
          </SelectForm>
          <input
            type="number"
            class="hidden"
            name="idcliente"
            value={loc.params.client}
          />
          <button class="me-4 cursor-pointer rounded-sm bg-black p-2 px-4 text-white hover:bg-gray-900 active:bg-gray-800 disabled:bg-gray-700 disabled:text-gray-100">
            {siteAddMode.value == 1 ? "Aggiungi" : "Modifica"}
          </button>
        </Form>
      </PopupModal>
    </>
  );
});
