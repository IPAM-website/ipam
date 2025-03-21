import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import { DocumentHead, server$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import sql from "../../../../../db";

export const useTecnici = server$(async () => {
  try {
    const query = await sql`SELECT * FROM tecnici`
    return query;
  }
  catch {
    return {
      errore: "SI"
    }
  }
})


export default component$(() => {
  const dati = useSignal();
      
      useTask$(async ()=>{
          const query = await useTecnici();
          dati.value = query;
      })
      
    return (
        <>
            <div class="size-full sm:px-24 lg:px-40 bg-white overflow-hidden">
              <Title haveReturn={true} url={"/admin/panel"}>Admin Panel</Title>
              <Table title="Lista clienti" nomeTabella="tecnici" dati={dati.value} nomePulsante="Aggiungi tecnico/i" ></Table>
            </div>
        </>
    )
})

export const head: DocumentHead = {
    title: "Gesione tecnici",
    meta: [
        {
            name: "Gestione tecnici",
            content: "Pagina dell'admin per la gestione dei tecnici",
        },
    ],
};