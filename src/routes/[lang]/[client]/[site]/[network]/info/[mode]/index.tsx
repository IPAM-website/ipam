/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable qwik/no-use-visible-task */
import {
  component$,
  useSignal,
  useTask$,
  useVisibleTask$,
} from "@builder.io/qwik";
import type {
  RequestHandler} from "@builder.io/qwik-city";
import {
  routeLoader$,
  server$,
  useLocation,
  useNavigate,
} from "@builder.io/qwik-city";
import { inlineTranslate } from "qwik-speak";
import sql from "~/../db";
import type { ReteModel } from "~/dbModels";

export const onRequest: RequestHandler = ({ redirect, params, url }) => {
  if (params.mode != "view")
    throw redirect(301, url.pathname.replace(params.mode, "view"));
};

export const useSiteName = routeLoader$(async ({ params }) => {
  if(params.site=="")
    return "";
  return (await sql`SELECT nomesito FROM siti WHERE idsito = ${params.site}`)[0]
    .nomesito;
});

export const useSiteNet = routeLoader$(async ({ params }) => {
  if(params.site=="")
    return [];
  return (await sql`SELECT * FROM rete INNER JOIN siti_rete ON rete.idrete=siti_rete.idrete WHERE idsito = ${params.site}`) as ReteModel[];
});

export const getNet = server$(async function () {
  if(this.params.network == "")
    return {} as ReteModel;
  return (
    await sql`SELECT * FROM rete WHERE idrete = ${this.params.network}`
  )[0] as ReteModel;
});

export const getNetworkSpace = server$(async (idrete: number) => {
  try {
    if(isNaN(idrete))
      throw new Error("idrete non disponibile")
    const query =
      (await sql`SELECT * FROM rete WHERE rete.idretesup = ${idrete} ORDER BY iprete`) as ReteModel[];
    let result = 0;

    for (const r of query) {
      result += Math.pow(2, 32 - r.prefissorete);
    }
    result += (
      await sql`SELECT * FROM indirizzi WHERE indirizzi.idrete = ${idrete}`
    ).length;

    return result;
  } catch (e) {
    console.log(e);
    return ["ERROR"];
  }
});

export const getParentNetwork = server$(async (idrete: number) => {
  try {
    if(isNaN(idrete))
      throw new Error("idrete non disponibile")
    const query = (
      await sql`SELECT r2.* FROM rete INNER JOIN rete as r2 ON rete.idretesup=r2.idrete WHERE rete.idrete = ${idrete}`
    )[0] as ReteModel;
    return query;
  } catch (e) {
    console.log(e);
    return ["ERROR"];
  }
});

export const getChildrenNetworks = server$(async (idrete: number) => {
  try {
    if(isNaN(idrete))
      throw new Error("idrete non disponibile")
    const query =
      (await sql`SELECT * FROM rete WHERE rete.idretesup = ${idrete}`) as ReteModel[];
    return query;
  } catch (e) {
    console.log(e);
    return ["ERROR"];
  }
});

export default component$(() => {
  const loc = useLocation();
  const nav = useNavigate();
  const network = useSignal<ReteModel>();
  const allocatedSpace = useSignal<number>(0);
  const parentNetwork = useSignal<ReteModel>();
  const childrenNetworks = useSignal<ReteModel[]>();
  const totalSpace = useSignal<number>(0);

  const lengthBar = useSignal(400);

  useTask$(async ({ track }) => {
    track(() => loc.url);
    network.value = await getNet();
    if (network.value) {
      allocatedSpace.value = (await getNetworkSpace(
        network.value.idrete,
      )) as number;
      parentNetwork.value = (await getParentNetwork(
        network.value.idrete,
      )) as ReteModel;
      childrenNetworks.value = (await getChildrenNetworks(
        network.value.idrete,
      )) as ReteModel[];

      totalSpace.value = Math.pow(2, 32 - network.value.prefissorete) - 2;
    }
  });

  const loading = useSignal(true);

  useVisibleTask$(() => {
    if (lengthBar.value > window.innerWidth - 40)
      lengthBar.value = window.innerWidth - 40;
    loading.value = false;
  });

  const t = inlineTranslate();

  return (
    <div>
      {/* <Title haveReturn={true} url={loc.url.pathname.split('/info')[0].split('/').slice(0,4).join('/')} > {sitename.value.toString()} IP</Title> */}
      {/* <SiteNavigator /> */}

      {network.value ? (
        <div class="flex w-full flex-col gap-4 p-1">
          <div class="flex flex-col gap-4 md:flex-row">
            <div class="mt-4 inline-flex flex-1 flex-col items-start justify-start gap-1 rounded-md border-1 border-gray-300 px-5 py-3 shadow-md">
              <div class="flex h-[50px] w-full items-center overflow-hidden">
                <div class="text-lg font-semibold text-black">{t("network.info.networkinformation")}</div>
              </div>
              <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                <div class="justify-start text-lg font-normal text-black">IP</div>
                <div class="justify-start text-lg font-normal text-black">
                  {network.value.iprete}
                </div>
              </div>
              <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                <div class="justify-start text-lg font-normal text-black">{t("prefix")}</div>
                <div class="justify-start text-lg font-normal text-black">
                  {network.value.prefissorete}
                </div>
              </div>
              <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                <div class="justify-start text-lg font-normal text-black">{t("network.info.TAS")}</div>
                <div class="justify-start text-lg font-normal text-black">
                  {totalSpace.value}
                </div>
              </div>
              <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                <div class="justify-start text-lg font-normal text-black">{t("network.info.AS")}</div>
                <div class="justify-start text-lg font-normal text-black">
                  {allocatedSpace.value}
                </div>
              </div>
              <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                <div class="justify-start text-lg font-normal text-black">{t("network.info.RAS")}</div>
                <div class="justify-start text-lg font-normal text-black">
                  {totalSpace.value - allocatedSpace.value}
                </div>
              </div>
            </div>
            <div class="mt-4 inline-flex flex-1 flex-col items-start justify-start gap-1 rounded-md border-1 border-gray-300 px-5 py-3 shadow-md">
              <div class="flex h-[50px] w-full items-center overflow-hidden">
                <div class="text-lg font-semibold text-black">{t("network.info.relativescomponents")}</div>
              </div>
              {parentNetwork.value && (
                <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                  <div class="justify-start text-lg font-normal text-black">{t("network.info.parent")}</div>
                  <div
                    class="cursor-pointer justify-start text-lg font-normal text-blue-500 hover:text-blue-700"
                    onClick$={() => {
                      const url_rete = loc.url.pathname.split("/");
                      url_rete[4] = parentNetwork.value!.idrete.toString();
                      nav(url_rete.join("/"));
                    }}
                  >
                    {parentNetwork.value?.iprete}
                  </div>
                </div>
              )}
              {childrenNetworks.value && childrenNetworks.value.length > 0 && (
                <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-gray-300 px-2 py-2.5">
                  <div class="justify-start text-lg font-normal text-black">Subnets</div>
                  <div class="justify-start text-lg font-normal text-black">
                    {childrenNetworks.value.map((x) => (
                      <p
                      key={x.idrete}
                        class="cursor-pointer text-blue-500 hover:text-blue-700"
                        onClick$={() => {
                          const url_rete = loc.url.pathname.split("/");
                          url_rete[4] = x.idrete.toString();
                          nav(url_rete.join("/"));
                        }}
                      >
                        {x.iprete}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {!(
                parentNetwork.value ||
                (childrenNetworks.value && childrenNetworks.value.length > 0)
              ) && (
                <div class="size-full">There are no relatives components</div>
              )}
            </div>
          </div>
          <div class="flex w-1/2 gap-4 max-sm:w-full sm:min-w-[620px]">
            <div class="flex w-full rounded-md border border-gray-300 p-3 shadow-md">
              <div class="relative me-5 flex-1">
                <h2 class="m-2 mb-1 text-[16pt] font-semibold">
                  Network Usage
                </h2>
                {!loading.value ? (
                  <div class="relative">
                    <div
                      class="absolute top-0 left-0 z-10 h-[40px] rounded-2xl bg-gray-400"
                      style={{ width: lengthBar.value }}
                    ></div>
                    <div
                      class="absolute top-0 left-0 z-20 h-[40px] rounded-2xl bg-green-500"
                      style={{
                        width:
                          (allocatedSpace.value / totalSpace.value) *
                          lengthBar.value,
                      }}
                    ></div>
                  </div>
                ) : (
                  <div class="absolute w-full animate-pulse">
                    <div class="h-[40px] rounded-2xl bg-gray-300"></div>
                  </div>
                )}
                <div class="mt-[48px]"></div>
                <p>
                  There are {allocatedSpace.value} of {totalSpace.value}{" "}
                  addresses in use
                </p>
              </div>
              {lengthBar.value >= 400 && (
                <div class="me-4 mt-1 flex flex-col justify-center">
                  <div class="flex items-center gap-2">
                    <div class="size-[8px] bg-green-500"></div>
                    {t("network.info.occupedspace")}
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="size-[8px] bg-gray-400"></div>
                    {t("network.info.freespace")}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div class="mt-2 flex min-h-[400px] w-full items-center justify-center rounded-2xl border border-gray-300 p-2">
          <p class="text-gray-500">{t("network.info.selectnetwork")}</p>
        </div>
      )}
    </div>
  );
});
