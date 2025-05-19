import { component$, Slot } from "@builder.io/qwik";

export default component$(() => {
  return (
    <>
      <button class="inline-flex h-10 w-[320px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-gray-950 px-4 font-['Inter'] text-base leading-normal font-medium text-white transition-all hover:-translate-y-1 hover:shadow active:bg-gray-800 md:w-[400px]">
        <Slot />
      </button>
    </>
  );
});
