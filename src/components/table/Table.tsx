import { $, component$, Slot, useTask$ } from "@builder.io/qwik";

interface TableProps { title?: string }

export default component$<TableProps>(({ title }) => {

    return (
        <div class="bg-white relative rounded-lg shadow-lg mb-2 border-1 border-offset-[-1px] border-neutral-200 mt-6">
            <Slot></Slot>
        </div>
    )
})