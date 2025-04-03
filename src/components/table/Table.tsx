import { $, component$, Slot, useTask$ } from "@builder.io/qwik";
import TitoloTable from "~/components/table/TitoloTable";
import Dati from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import Import from "~/components/table/ImportCSV";

interface TableProps { title?: string, dati ?: any, nomeTabella: string, nomePulsante : string, nomeImport : string, onUpdate$?: (e:any)=>void, onDelete$?:(e:any)=>{} }

export default component$<TableProps>(({ title, nomeTabella, nomePulsante, nomeImport, onUpdate$=$(()=>{}), onDelete$=$(()=>{}) }) => {

    return (
        <div class="bg-white rounded-lg relative shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] border-1 border-offset-[-1px] border-neutral-200 mt-12">
            <TitoloTable nomeTitolo={title}></TitoloTable>
            <Slot></Slot>
            <Import nomeImport={nomeImport}></Import>
        </div>
    )
})