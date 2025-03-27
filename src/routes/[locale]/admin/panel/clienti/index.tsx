import { component$, getLocale, useSignal, useTask$ } from "@builder.io/qwik";
import { DocumentHead, server$, useLocation } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import sql from "~/../db";

export const useTecnici = server$(async () => {
  try {
    const query = await sql`SELECT * FROM clienti`
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
  const lang = getLocale("en");
      useTask$(async ()=>{
          const query = await useTecnici();
          dati.value = query;
      })
      
    return (
        <>
            <div class="size-full sm:px-24 lg:px-40 bg-white overflow-hidden">
              <Title haveReturn={true} url={"/"+lang+"/admin/panel"}>{$localize`Admin Panel`}</Title>
              <Table title={$localize`Lista clienti`} nomeTabella={$localize`clients`} dati={dati.value} nomePulsante={$localize`Aggiungi cliente/i`} nomeImport="clienti"></Table>
            </div>
        </>
    )
})

export const head: DocumentHead = {
    title: "Gesione clienti",
    meta: [
        {
            name: "Gestione clienti",
            content: "Pagina dell'admin per la gestione dei tecnici",
        },
    ],
};