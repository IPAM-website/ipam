import {
  $,
  component$,
  useSignal,
  useStyles$,
  useTask$,
} from "@builder.io/qwik";
import {
  server$,
  useLocation,
  useNavigate,
} from "@builder.io/qwik-city";
import { getBaseURL } from "~/fnUtils";
import SelectForm from "../forms/formsComponents/SelectForm";
import { ReteModel } from "~/dbModels";
import cssStyle from "./SiteNavigator.css?inline";
import sql from "../../../db";

export const useNetworks = server$(async function () {
  return (await sql`SELECT * FROM rete INNER JOIN siti_rete ON rete.idrete = siti_rete.idrete WHERE siti_rete.idsito = ${this.params.site}`) as ReteModel[];
});

export default component$(
  ({
    networkChange$,
    onPageChange$ = () => {},
  }: {
    networkChange$?: (idrete: string) => void;
    onPageChange$?: () => void;
  }) => {
    useStyles$(cssStyle);

    const nav = useNavigate();
    const loc = useLocation();

    const refnav = useSignal<HTMLDivElement>();

    const siteNetworks = useSignal<ReteModel[]>([]);

    const siteURL = getBaseURL() + loc.params.client + "/" + loc.params.site;

    const smartRedirect = $((path: string) => {
      if (loc.url.href.includes(path)) return;
      const networkURL =
        getBaseURL() +
        loc.params.client +
        "/" +
        loc.params.site +
        "/" +
        loc.params.network;
      onPageChange$();
      nav(networkURL + path);
    });

    const navVisible = useSignal(false);
    const navClosing = useSignal(false);

    useTask$(async () => {
      siteNetworks.value = await useNetworks();
    });

    const toggleNav = $(() => {
      if (!navVisible.value) {
        if (refnav.value) refnav.value.style.display = "block";
        navVisible.value = true;
        navClosing.value = false;
      } else {
        navClosing.value = true;
        setTimeout(() => {
          navVisible.value = false;
          navClosing.value = false;
          if (refnav.value) refnav.value.style.display = "none";
        }, 300); // durata animazione in ms
      }
    });

    return (
      <div class="flex flex-col gap-4 md:flex-row">
        <div class="flex w-full flex-col items-center justify-between max-xl:gap-2 xl:flex-row">
          <button
            class="mt-3 block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 focus:outline-none sm:hidden"
            onClick$={toggleNav}
            aria-expanded
            aria-controls=""
          >
            MENU
          </button>

          <nav
            ref={refnav}
            class={
              "mt-4 rounded-xl bg-white px-2 py-1 shadow max-sm:fixed max-sm:top-0 max-sm:left-0 max-sm:hidden sm:block " +
              (navClosing.value ? "hideFullScreen" : "showFullScreen")
            }
          >
            <ul class="space-x-1 overflow-x-hidden *:w-full **:w-full sm:flex">
              <li>
                <button
                  onClick$={() => smartRedirect("/info")}
                  class={
                    `rounded-lg border border-transparent px-4 py-2 font-medium transition-all hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200 ` +
                    (loc.url.pathname.includes("/info")
                      ? " bg-blue-200 text-blue-800"
                      : "text-gray-700")
                  }
                >
                  Info
                </button>
              </li>
              <li>
                <span class="h-6 w-px self-center bg-gray-200"></span>
              </li>
              <li>
                <button
                  onClick$={() => smartRedirect("/addresses")}
                  class={
                    `rounded-lg border border-transparent px-4 py-2 font-medium transition-all hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200 ` +
                    (loc.url.pathname.includes("/addresses")
                      ? " bg-blue-200 text-blue-800"
                      : "text-gray-700")
                  }
                >
                  Addresses
                </button>
              </li>
              <li>
                <span class="h-6 w-px self-center bg-gray-200"></span>
              </li>
              <li>
                <button
                  onClick$={() => smartRedirect("/aggregates")}
                  class={
                    `rounded-lg border border-transparent px-4 py-2 font-medium transition-all hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200 ` +
                    (loc.url.pathname.includes("/aggregates")
                      ? " bg-blue-200 text-blue-800"
                      : "text-gray-700")
                  }
                >
                  Aggregate
                </button>
              </li>
              <li>
                <span class="h-6 w-px self-center bg-gray-200"></span>
              </li>
              <li>
                <button
                  onClick$={() => smartRedirect("/intervals")}
                  class={
                    `rounded-lg border border-transparent px-4 py-2 font-medium transition-all hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200 ` +
                    (loc.url.pathname.includes("/intervals")
                      ? " bg-blue-200 text-blue-800"
                      : "text-gray-700")
                  }
                >
                  Intervals
                </button>
              </li>
              <li>
                <span class="h-6 w-px self-center bg-gray-200"></span>
              </li>
              <li>
                <button
                  onClick$={() => smartRedirect("/vrf")}
                  class={
                    `rounded-lg border border-transparent px-4 py-2 font-medium transition-all hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200 ` +
                    (loc.url.pathname.includes("/vrf")
                      ? " bg-blue-200 text-blue-800"
                      : "text-gray-700")
                  }
                >
                  VRF
                </button>
              </li>
              <li>
                <span class="h-6 w-px self-center bg-gray-200"></span>
              </li>
              <li>
                <button
                  onClick$={() => smartRedirect("/vlan")}
                  class={
                    `rounded-lg border border-transparent px-4 py-2 font-medium transition-all hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 focus:ring-2 focus:ring-blue-400 focus:outline-none focus:ring-inset active:bg-blue-200 ` +
                    (loc.url.pathname.includes("/vlan")
                      ? " bg-blue-200 text-blue-800"
                      : "text-gray-700")
                  }
                >
                  VLANs
                </button>
              </li>
              <li>
                <span class="h-6 w-px self-center bg-gray-200"></span>
              </li>
              {/* <li>
                        <button
                            onClick$={() => smartRedirect("/settings")}
                            class={`px-4 py-2 rounded-lg font-medium transition 
               hover:bg-blue-100 hover:text-blue-700 focus:bg-blue-200 focus:text-blue-800 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
               active:bg-blue-200
               border border-transparent ` + (loc.url.pathname.includes("/settings") ? " bg-blue-200 text-blue-800" : "text-gray-700")}
                        >
                            Settings
                        </button>
                    </li> */}
            </ul>
          </nav>

          <div class="showFullScreen relative flex items-center gap-0 max-sm:mt-1">
            <span class="text-md">Network:</span>

            <SelectForm
              value={loc.params.network != "0" ? loc.params.network : ""}
              errorNotification={{
                condition: loc.params.network == "0",
                text: "Select a network",
              }}
              noPointer={true}
              OnClick$={async (e) => {
                if (!(e.target instanceof HTMLOptionElement)) return;
                const idrete = (e.target as HTMLOptionElement).value;
                const urlParts = loc.url.pathname.split("/");
                nav(
                  `${getBaseURL()}${loc.params.client}/${loc.params.site}/${idrete}/${urlParts.slice(5).join("/")}`,
                );
                if (networkChange$) networkChange$(idrete);
              }}
              id=""
              name=""
            >
              {siteNetworks.value.map((x) => (
                <option value={x.idrete}>{x.nomerete}</option>
              ))}
            </SelectForm>
          </div>
        </div>
      </div>
    );
  },
);
