import { $, component$, Slot, useTask$ } from "@builder.io/qwik";
import TitoloTable from "~/components/table/TitoloTable";

interface TableProps { title?: string }

export default component$<TableProps>(({ title }) => {

    return (
        <div class="bg-white relative rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] border-1 border-offset-[-1px] border-neutral-200 mt-12">
            <Slot></Slot>
        </div>
    )
})