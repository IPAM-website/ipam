import { $, component$ } from "@builder.io/qwik";

interface HeaderProps { nomeHeader?: string }

export default component$<HeaderProps>(({ nomeHeader }) => {

    return (
        <div class="left-[24px] top-[24px] absolute justify-start text-black text-base font-semibold font-['Inter'] leading-normal">{ nomeHeader }</div>
    )
})