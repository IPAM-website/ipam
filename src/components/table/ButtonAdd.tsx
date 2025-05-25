/* eslint-disable qwik/valid-lexical-scope */
import { component$ } from "@builder.io/qwik";

interface ButtonProps {
  nomePulsante: string;
  onClick$: () => void;
}

export default component$<ButtonProps>(({ nomePulsante, onClick$ }) => {
  return (
    <div
      class="m-4 mb-8 flex h-9 w-7/10 max-w-[300px] cursor-pointer items-center justify-center rounded-lg bg-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900 px-4 transition-all duration-200 ease-in hover:w-4/5 hover:bg-gray-900"
      onClick$={onClick$}
    >
      <div class="flex h-full items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="h-5 w-5 text-white"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <div class="font-['Inter'] text-base leading-normal font-medium text-white">
          {nomePulsante}
        </div>
      </div>
    </div>
  );
});
