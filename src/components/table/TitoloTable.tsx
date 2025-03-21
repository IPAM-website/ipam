import { $, component$ } from "@builder.io/qwik";

interface TitoloTableProps { nomeTitolo?: string }

export default component$<TitoloTableProps>(({ nomeTitolo }) => {

    return (
        <div class="m-5 text-black text-base font-semibold font-['Inter'] leading-normal">{ nomeTitolo }</div>
    )
})