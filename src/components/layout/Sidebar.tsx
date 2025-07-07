import {
  $,
  component$,
  getLocale,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import Accordion from "./Accordion/Accordion";
import { NavLink } from "./NavLink";
import {
  useLocation,
  useNavigate,
} from "@builder.io/qwik-city";
import { getBaseURL, getUser, isUserClient } from "~/fnUtils";
import { inlineTranslate } from "qwik-speak";

export const toggleSidebar = $(() => {
  const sidebar = document.getElementById("sidebar");
  const cover = document.getElementById("cover");
  if (sidebar) {
    sidebar.classList.toggle("w-[240px]");
    sidebar.classList.toggle("w-[0px]");
    sidebar.classList.toggle("border-1");
  }
  if (cover) {
    cover.classList.toggle("bg-black/8");
    cover.classList.toggle("hidden");
  }
  document.body.classList.toggle("overflow-hidden");
});

export const setClientName = $((clientName: string) => {
  const target = document.getElementsByClassName("client-name")[0];
  target.textContent = clientName;
});

export const setSiteName = $((siteName: string) => {
  const target = document.getElementsByClassName("site-name")[0];
  target.textContent = siteName;
});

export default component$(() => {
  const nav = useNavigate();
  const loc = useLocation();

  const user = useSignal<{ mail: string; id: number; admin: boolean }>();
  const isClient = useSignal(false);
  useTask$(async () => {
    user.value = await getUser();
    isClient.value = await isUserClient();
  });

  const lang = getLocale("en");
  const insideSS = loc.params.site;
  const baseSiteUrl =
    getBaseURL() +
    loc.params.client +
    "/" +
    loc.params.site +
    "/" +
    (loc.params.network!=undefined ? loc.params.network : "0") +
    "/";

  const t = inlineTranslate();

  return (
    <div>
      <div
        id="sidebar"
        class="fixed top-0 left-0 z-20 h-full w-[0px] overflow-hidden border-gray-200 dark:border-gray-950 bg-white dark:bg-gray-900 transition-all "
      >
        <div class="h-full w-[240px] p-2">
          <div class="flex h-full flex-col overflow-hidden bg-white dark:bg-gray-900 text-black dark:text-gray-50">
            <div>
              <div class="client-name justify-center font-['Inter'] text-[18pt] leading-[40px] font-semibold ">
                ---
              </div>
              <div class="site-name justify-center font-['Inter'] text-[14pt] leading-[20px] font-semibold text-[#808080]">
                ---
              </div>
            </div>

            <hr class="my-2 text-gray-300" />
            {insideSS ? (
              <div>
                <h1 class="h1 m-0 w-full p-0 text-center font-semibold">
                  Viste
                </h1>

                <Accordion title={t("sidebar.ip.title")}>
                  <NavLink
                  href={baseSiteUrl + "addresses/view"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.ip.view")}</NavLink>
                  <NavLink
                  href={baseSiteUrl + "addresses/insert"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.ip.add")}</NavLink>
                </Accordion>

                <Accordion title={t("sidebar.intervals.title")}>
                  <NavLink
                  href={baseSiteUrl + "intervals/view"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.intervals.view")}</NavLink>
                  <NavLink
                  href={baseSiteUrl + "intervals/insert"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.intervals.add")}</NavLink>
                </Accordion>

                <Accordion title={t("sidebar.aggregates.title")}>
                  <NavLink
                  href={baseSiteUrl + "aggregates/view"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.aggregates.view")}</NavLink>
                  {/* <NavLink
                  href={baseSiteUrl + "aggregates/create"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.aggregates.add")}</NavLink> */}
                </Accordion>

                <Accordion title="VRF">
                  <NavLink
                  href={baseSiteUrl + "vrf/view"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.vrf.view")}</NavLink>
                  <NavLink
                  href={baseSiteUrl + "vrf/insert"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.vrf.add")}</NavLink>
                </Accordion>

                <Accordion title="VLAN">
                  <NavLink
                  href={baseSiteUrl + "vlan/view"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.vlan.view")}</NavLink>
                  <NavLink
                  href={baseSiteUrl + "vlan/insert"}
                  activeClass="text-black"
                  class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black dark:hover:text-gray-100"
                  onClick$={toggleSidebar}
                  >{t("sidebar.vlan.insert")}</NavLink>
                </Accordion>
              </div>
            ) : (
              <div class="my-1 text-sm text-gray-600 dark:text-gray-200">
                {/* {$localize`No options available here. Select a site from the dashboard to start.`} */}
                {t("sidebar.nooptions")}
              </div>
            )}

            <div>
              {(loc.params.site || !isClient.value) && (
                <div class="my-3 flex-1 justify-start text-center font-['Inter'] text-base leading-normal font-semibold text-black dark:text-gray-50">{t("sidebar.buttonstitle")}</div>
              )}

              {!isClient.value && (
                <button
                  type="button"
                  class="block w-full cursor-pointer rounded-lg bg-[#0094ff] dark:bg-[#0072dd] p-1 text-center font-['Inter'] text-base leading-normal text-white hover:bg-[#0083ee]"
                  onClick$={() => nav("/" + lang + "/dashboard")}
                >
                  {t("sidebar.buttons.changeclient")}
                </button>
              )}

              {loc.params.site && (
                <button
                  type="button"
                  class="my-1 block w-full cursor-pointer rounded-lg bg-[#d506ff] dark:bg-[#b506ff] p-1 text-center font-['Inter'] text-base leading-normal text-white hover:bg-[#c405ee]"
                  onClick$={() => nav(getBaseURL()+"/"+loc.params.client)}
                >
                  {t("sidebar.buttons.changesite")}
                </button>
              )}

              {loc.params.site && (
                <button
                  type="button"
                  class="my-1 block w-full cursor-pointer rounded-lg bg-[#1ada3a] dark:bg-[#10d030] p-1 text-center font-['Inter'] text-base leading-normal text-white hover:bg-[#10d030]"
                  onClick$={() => nav(`${getBaseURL()}/${loc.params.client}/${loc.params.site}`)}
                >
                  {t("sidebar.buttons.gotosite")}
                </button>
              )}

              {user.value?.admin && (
                <button
                  type="button"
                  class="my-1 block w-full cursor-pointer rounded-lg bg-[#ff8936] dark:bg-[#ff6936] p-1 text-center font-['Inter'] text-base leading-normal text-white hover:bg-[#ee7825]"
                  onClick$={() => nav("/" + lang + "/admin/panel")}
                >
                  {t("sidebar.buttons.adminpanel")}
                </button>
              )}
            </div>

            <div class="h-full"></div>

            <div>
              <div class="font-['Inter'] text-sm text-[#4f4f4f]">
                {/* {$localize`Logged as`} <br />
                <span class="text-md font-semibold text-black">
                  {user.value?.mail}
                </span> */}
                <span dangerouslySetInnerHTML={t("sidebar.email@@Log as {{email}}", { email: user.value?.mail })} class="dark:text-gray-400"></span>
              </div>

              <button
                class="my-1 block w-full cursor-pointer rounded-lg bg-gray-800 p-1 text-center font-['Inter'] text-base leading-normal font-medium text-white hover:bg-black dark:bg-gray-200 dark:hover:bg-gray-100 dark:hover:text-gray-900 dark:text-gray-800"
                onClick$={async () => {
                  await fetch("/api/cookie", { method: "DELETE" });
                  nav("/" + lang + "/login");
                }}
              >{t("sidebar.logout")}</button>
            </div>
          </div>
        </div>
      </div>
      <div
        id="cover"
        class="fixed top-0 left-0 z-10 hidden h-full w-full transition-all"
        onClick$={toggleSidebar}
      ></div>
    </div>
  );
});
