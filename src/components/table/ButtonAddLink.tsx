import { component$ } from "@builder.io/qwik";

interface ButtonProps { nomePulsante : string, href: string}

export default component$<ButtonProps>(({ nomePulsante, href }) => {
    return (
        <div class="w-96 h-8 px-4 bg-black rounded-lg inline-flex justify-center items-center gap-2 m-4 cursor-pointer hover:w-[400px] transition-all duration-200 ease-in">
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 text-white">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <a class="text-white block text-base font-medium font-['Inter'] leading-normal" href={href}>
                    { nomePulsante }
                </a>
            </div>
        </div>
    );
});