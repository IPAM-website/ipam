import { component$ } from "@builder.io/qwik";

export const selectSearchbar = ()=>{
    const searchbar = document.querySelector("#searchbar") as HTMLInputElement;
    if(searchbar)
    {
        searchbar.focus();
    }
}

export default component$(() => {
    return (
        <div class="flex items-center w-[400px] md:w-[280px] lg:w-[320px] mt-3 p-2 border border-gray-300 rounded-sm">
            <button class="cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
            <input placeholder={$localize`Search...`} class="font-['Inter'] outline-0 ms-1 w-full" id="searchbar" />
        </div>
    )
})