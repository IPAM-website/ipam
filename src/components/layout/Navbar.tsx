import {
  component$,
  getLocale
} from "@builder.io/qwik";

import { toggleSidebar } from "./Sidebar";
import SelectLang from "../utils/SelectLang";
import { useNavigate } from "@builder.io/qwik-city";
import { ThemeSwitch } from "../utils/ThemeSwitch";

export default component$(() => {

  const nav = useNavigate();
  const lang = getLocale("en")

  return (
    <>
      <div class="mb-8 flex h-16 w-full border-b dark:bg-gray-800 border-[#dfdfdf] dark:border-[#4f4f4f] bg-white *:h-full *:items-center">
        <div class="flex flex-none items-center justify-between ps-3 sm:ps-0 sm:justify-end pe-2">
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
        <div class="flex max-sm:collapse sm:w-10/11 flex-auto">
          <span class="font-['Inter'] dark:text-gray-100 text-xl leading-[30px] font-semibold text-black">
            IP Address Manager
          </span>
        </div>
        <div class="flex gap-2 pe-5 justify-end sm:gap-4 md:gap-8 "> {/*w-1/4 sm:w-1/6 */}
        <ThemeSwitch />
          <div class="">
            <SelectLang />

          </div>
          <div class="">
            <button
              class="group bg-gray-900 text-white p-2 rounded-lg cursor-pointer flex items-center justify-start transition-all gap-2 max-w-[36px] md:hover:max-w-[100px] duration-300 overflow-hidden relative dark:bg-gray-200 dark:hover:bg-gray-100 dark:hover:text-gray-800 dark:text-gray-200 "
              onClick$={async () => {
              await fetch("/api/cookie", { method: "DELETE" });
              nav("/" + lang + "/login");
              }}
            >
              <span class="flex items-center dark:text-gray-800 dark:hover:text-gray-800 dark:hover:bg-gray-100 dark:group-hover:text-gray-800 dark:group-hover:bg-gray-100 dark:group-hover:border-gray-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="size-5"
              >
                <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                />
              </svg>
              </span>
              <span
              class="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:group-hover:pointer-events-auto dark:text-gray-800 dark:group-hover:text-gray-800 dark:group-hover:bg-gray-100 dark:group-hover:border-gray-100"
              >
              Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
});
