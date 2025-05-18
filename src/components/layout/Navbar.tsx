import {
  $,
  component$,
  getLocale,
  useSignal,
} from "@builder.io/qwik";
import { NavLink } from "../NavLink/NavLink";
import {
  useNavigate,
} from "@builder.io/qwik-city";
import { toggleSidebar } from "./Sidebar";

export default component$(() => {
  const clicked = useSignal(false);
  const nav = useNavigate();

  const logout = $(async () => {
    await fetch("/api/cookie", { method: "DELETE" });
    nav("/" + getLocale() + "/login");
  });

  const settingUrl = "/" + getLocale("en") + "/settings";
  const detailsUrl = "/" + getLocale("en") + "/details";
  return (
    <>
      <div class="mb-8 flex h-16 w-full border-b border-[#dfdfdf] bg-white *:h-full *:items-center">
        <div class="flex w-1/12 flex-none items-center justify-end pe-2">
          <button class="cursor-pointer" onClick$={toggleSidebar}>
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
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
        <div class="flex w-9/12 flex-auto">
          <span class="font-['Inter'] text-xl leading-[30px] font-semibold text-black">
            IP Address Manager
          </span>
        </div>
        <div
          class="flex w-2/12 flex-auto cursor-pointer"
          onClick$={() => {
            clicked.value = !clicked.value;
          }}
        >
          <img
            class="h-[40px] w-[40px] rounded-full"
            src="https://placehold.co/40x40"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class={
              "ms-2 size-4 transition-all " +
              (clicked.value ? "rotate-z-180" : "")
            }
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
          <div
            class={
              "absolute top-14 w-28 overflow-hidden rounded-md border-gray-300 bg-white transition-all *:cursor-pointer " +
              (clicked.value ? "h-[88px] border border-gray-300" : "h-[0px]")
            }
          >
            <div class="flex h-[88px] flex-col p-2 pt-1 text-xs text-gray-500 *:py-1 *:hover:text-black">
              <NavLink
                href={detailsUrl}
                activeClass="text-black"
              >{$localize`Dettagli`}</NavLink>
              <NavLink
                href={settingUrl}
                activeClass="text-black"
              >{$localize`Impostazioni`}</NavLink>
              <button
                onClick$={logout}
                class="mt-1 cursor-pointer rounded-lg bg-gray-900 p-1 text-white transition-all hover:border hover:bg-white"
              >{$localize`Logout`}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
