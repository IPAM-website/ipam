import {
  component$
} from "@builder.io/qwik";

import { toggleSidebar } from "./Sidebar";

export default component$(() => {
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
        <div>

        </div>
      </div>
    </>
  );
});
