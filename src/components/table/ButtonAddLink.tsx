import { component$ } from "@builder.io/qwik";

interface ButtonProps {
  nomePulsante: string;
  href: string;
}

export default component$<ButtonProps>(({ nomePulsante, href }) => {
  return (
    <a
      class="m-4 mb-8 flex h-9 w-7/10 max-w-[300px] cursor-pointer items-center justify-center rounded-lg bg-black px-4 transition-all duration-200 ease-in hover:w-4/5 hover:max-w-[360px]"
      href={href}
    >
      <div class="flex items-center gap-2">
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
        <span class="block font-['Inter'] text-base leading-normal font-medium text-white">
          {nomePulsante}
        </span>
      </div>
    </a>
  );
});
