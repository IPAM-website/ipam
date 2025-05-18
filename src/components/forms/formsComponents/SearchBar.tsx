import { component$ } from "@builder.io/qwik";

export const selectSearchbar = () => {
  const searchbar = document.querySelector("#searchbar") as HTMLInputElement;
  if (searchbar) {
    searchbar.focus();
  }
};

export default component$(() => {
  return (
    <div class="mt-3 flex w-[400px] items-center rounded-sm border border-gray-300 p-2 md:w-[280px] lg:w-[320px]">
      <button class="cursor-pointer">
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
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </button>
      <input
        placeholder={$localize`Search...`}
        class="ms-1 w-full font-['Inter'] outline-0"
        id="searchbar"
      />
    </div>
  );
});
