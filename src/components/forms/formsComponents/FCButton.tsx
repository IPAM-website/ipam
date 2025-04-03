import { component$ } from "@builder.io/qwik";

export default component$(() => {
    return (
        <>
            <button class="w-[320px] md:w-[400px] h-10 px-4 cursor-pointer bg-gray-950 rounded-lg inline-flex justify-center items-center gap-2 text-white text-base font-medium font-['Inter'] leading-normal transition-all hover:shadow hover:-translate-y-1 active:bg-gray-800">
                {$localize`Conferma`}
            </button>
        </>
    );
})
