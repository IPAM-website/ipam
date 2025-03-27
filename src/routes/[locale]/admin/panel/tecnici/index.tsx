import { component$, getLocale, useSignal, useTask$, $ } from "@builder.io/qwik";
import { DocumentHead, server$, Form, routeAction$, RequestEventAction } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import ButtonAdd from "~/components/table/ButtonAdd";
import TecniciModal from "~/components/forms/tecniciFormModal";
import sql from "~/../db";

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

export const addTecnico = routeAction$(async (data, requestEvent : RequestEventAction) => {
  console.log(data)
});

export default component$(() => {
  const showDialog = useSignal(false);
  const dati = useSignal();
  const lang = getLocale("en");
  const formConf = addTecnico()
      useTask$(async ()=>{
          const query = await useTecnici();
          dati.value = query;
      })

  const openTeniciDialog = $(() => {
      showDialog.value = true;
  });

  const confirmModifyT = $(async (nome: string, cognome: string, ruolo:string, mail:string, telefono:string, password:string) => {
      const result = formConf.submit({nome, cognome, ruolo, mail, telefono, password});
      console.log("Conferma");
  })

  const cancelModifyT = $(() => {
      console.log("Annulla");
      showDialog.value = false;
  });
      
    return (
        <>
            <div class="size-full sm:px-24 lg:px-40 bg-white overflow-hidden">
              <Title haveReturn={true} url={"/"+lang+"/admin/panel"}>{$localize`Admin Panel`}</Title>
              <Table title={$localize`Lista tecnici`} nomeTabella={$localize`technicians`} dati={dati.value} nomePulsante={$localize`Aggiungi tecnico/i`} nomeImport="tecnici">
                <ButtonAdd nomePulsante={$localize`Inserisci tecnico`} onClick$={openTeniciDialog}></ButtonAdd>
              </Table>
            </div>

              {/* Modal tecnici */}
              <TecniciModal isOpen={showDialog.value}
                  onConfirm={confirmModifyT}
                  onCancel={cancelModifyT}
                  title={$localize`Aggiungi tecnico`}
                  confirmText={$localize`Conferma`}
                  cancelText={$localize`Annulla`}
              />
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