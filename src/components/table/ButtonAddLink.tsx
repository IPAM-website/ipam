import { component$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";

interface ButtonProps {
  nomePulsante: string;
  href: string;
}

export default component$<ButtonProps>(({ nomePulsante, href }) => {
  const nav = useNavigate();
  return (
    <button
      class="m-4 mb-8 flex h-9 w-7/10 max-w-[300px] cursor-pointer items-center justify-center rounded-lg bg-black px-4 transition-all duration-200 ease-in hover:w-4/5 hover:bg-gray-900 dark:bg-gray-200 dark:hover:bg-white"
      onClick$={()=>nav(href)}
    >
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
          class="h-5 w-5 text-white dark:text-gray-800"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        <span class="block font-['Inter'] text-base leading-normal font-medium text-white dark:text-gray-800">
          {nomePulsante}
        </span>
      </div>
    </button>
  );
});
