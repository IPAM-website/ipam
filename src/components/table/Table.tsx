import { $, component$, Slot } from "@builder.io/qwik";
import TitoloTable from "~/components/table/TitoloTable";
import Dati from "~/components/table/Dati_Headers";
import Import from "~/components/table/ImportCSV";

interface TableProps { title?: string, dati ?: any, nomeTabella: string, nomeImport : string }

export default component$<TableProps>(({ title, dati, nomeTabella, nomeImport }) => {

    return (
        <div class="bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] border-1 border-offset-[-1px] border-neutral-200 mt-12">
            <TitoloTable nomeTitolo={title}></TitoloTable>
            <Dati dati={dati} nomeTabella={nomeTabella}></Dati>
            <Slot></Slot>
            <Import nomeImport={nomeImport}></Import>
        </div>
    )
})