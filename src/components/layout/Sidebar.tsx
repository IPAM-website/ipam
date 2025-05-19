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
  }
  if (cover) {
    cover.classList.toggle("bg-black/10");
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
    loc.params.network +
    "/";

  const t = inlineTranslate();

  return (
    <div>
      <div
        id="sidebar"
        class="fixed top-0 left-0 z-20 h-full w-[0px] overflow-hidden border-1 border-gray-200 bg-white transition-all"
      >
        <div class="h-full w-[240px] p-2">
          <div class="flex h-full flex-col overflow-hidden bg-white">
            <div>
              <div class="client-name justify-center font-['Inter'] text-[18pt] leading-[40px] font-semibold text-black">
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
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.ip.view")}</NavLink>
                  <NavLink
                    href={baseSiteUrl + "addresses/insert"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.ip.add")}</NavLink>
                </Accordion>

                <Accordion title={t("sidebar.intervals.title")}>
                  <NavLink
                    href={baseSiteUrl + "intervals/view"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.intervals.view")}</NavLink>
                  <NavLink
                    href={baseSiteUrl + "intervals/create"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.intervals.add")}</NavLink>
                </Accordion>

                <Accordion title={t("sidebar.aggregates.title")}>
                  <NavLink
                    href={baseSiteUrl + "aggregates/view"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.aggregates.view")}</NavLink>
                  <NavLink
                    href={baseSiteUrl + "aggregates/create"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.aggregates.add")}</NavLink>
                </Accordion>

                <Accordion title="VFR">
                  <NavLink
                    href={baseSiteUrl + "VFR/view"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.vrf.view")}</NavLink>
                  <NavLink
                    href={baseSiteUrl + "VFR/create"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.vrf.add")}</NavLink>
                </Accordion>

                <Accordion title="VLAN">
                  <NavLink
                    href={baseSiteUrl + "VLAN/view"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.vlan.view")}</NavLink>
                  <NavLink
                    href={baseSiteUrl + "VLAN/create"}
                    activeClass="text-black"
                    class="block font-['Inter'] text-sm leading-6 font-semibold text-[#827d7d] hover:text-black"
                    onClick$={toggleSidebar}
                  >{t("sidebar.vlan.view")}</NavLink>
                </Accordion>
              </div>
            ) : (
              <div class="my-1 text-sm text-gray-600">
                {/* {$localize`No options available here. Select a site from the dashboard to start.`} */}
                {t("sidebar.nooptions")}
              </div>
            )}

            <div>
              {(loc.params.site || !isClient.value) && (
                <div class="my-3 flex-1 justify-start text-center font-['Inter'] text-base leading-normal font-semibold text-black">{t("sidebar.buttonstitle")}</div>
              )}

              {!isClient.value && (
                <a
                  href={"/" + lang + "/dashboard"}
                  class="block cursor-pointer rounded-lg bg-[#0094ff] p-1 text-center font-['Inter'] text-base leading-normal text-white hover:bg-[#0083ee]"
                >
                  {/* {$localize`Change client`} */}
                  {t("sidebar.buttons.changeclient")}
                </a>
              )}

              {loc.params.site && (
                <a
                  href={baseSiteUrl.replace(loc.params.site + "/", "")}
                  class="my-1 block cursor-pointer rounded-lg bg-[#d506ff] p-1 text-center font-['Inter'] text-base leading-normal text-white hover:bg-[#c405ee]"
                >
                  {t("sidebar.buttons.changesite")}
                </a>
              )}

              {loc.params.site && (
                <a
                  href={baseSiteUrl}
                  class="my-1 block cursor-pointer rounded-lg bg-[#1ada3a] p-1 text-center font-['Inter'] text-base leading-normal text-white hover:bg-[#10d030]"
                >
                  {t("sidebar.buttons.gotosite")}
                </a>
              )}

              {user.value?.admin && (
                <a
                  href={"/" + lang + "/admin/panel"}
                  class="my-1 block cursor-pointer rounded-lg bg-[#ff8936] p-1 text-center font-['Inter'] text-base leading-normal text-white hover:bg-[#ee7825]"
                >
                  {t("sidebar.buttons.adminpanel")}
                </a>
              )}
            </div>

            <div class="h-full"></div>

            <div>
              <div class="font-['Inter'] text-sm text-[#4f4f4f]">
                {/* {$localize`Logged as`} <br />
                <span class="text-md font-semibold text-black">
                  {user.value?.mail}
                </span> */}
                <span dangerouslySetInnerHTML={t("sidebar.email@@Log as {{email}}",{email:user.value?.mail})}></span>
              </div>

              <button
                class="my-1 block w-full cursor-pointer rounded-lg bg-gray-800 p-1 text-center font-['Inter'] text-base leading-normal font-medium text-white hover:bg-black"
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
