import { $, component$, getLocale, useSignal, useStyles$, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { DocumentHead, Form, RequestEventAction, routeAction$, server$, useLocation, z, zod$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import styles from "../dialog.css?inline";
import TextBoxForm from '~/components/forms/formsComponents/TextboxForm';
import Import from "~/components/table/ImportCSV";
import sql from "~/../db";

type Notification = {
  message: string;
  type: 'success' | 'error';
};

export const extractRow = (row: any) => {
  const { idcliente, nomecliente } = row;
  return {
    idcliente,
    nomecliente
  }
}

export const deleteRow = server$(async function(this,data){
  try{
    
    await sql`DELETE FROM cliente_tecnico WHERE cliente_tecnico.idtecnico = ${data.idtecnico} AND cliente_tecnico.idcliente = ${data.idcliente}`;
    return true;
  }catch(e)
  {
    console.log(e);
    return false;
  }
})

export const useTecnici = server$(async () => {
  try {
    const query = await sql`SELECT * FROM clienti`;
    // Assicurati di sempre ritornare un array
    return Array.isArray(query) ? query : [];
  }
  catch (error) {
    console.error("Database error:", error);
    return []; // Ritorna array vuoto invece di oggetto
  }
});

export const modCliente = routeAction$(async (data, requestEvent : RequestEventAction) => {
  try
  {
    console.log(data);
    await sql`
      UPDATE clienti
      SET nomecliente = ${data.nome}
      WHERE idcliente = ${data.idcliente}
    `;
    return {
      success: true,
      message: "Cliente modificato con successo"
    }
  }
  catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Errore durante l'inserimento del cliente"
    }
  }
},zod$({
  idcliente: z.string(),
  nome: z.string().min(2),
}))

export const addCliente = routeAction$(async (data, requestEvent : RequestEventAction) => {
  try
  {
    await sql`
      INSERT INTO clienti (nomecliente)
      VALUES (${data.nome})
    `;
    return {
      success: true,
      message: "Cliente inserito con successo"
    }
  }
  catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Errore durante l'inserimento del cliente"
    }
  }
},zod$({
  nome: z.string().min(2)
}))


export default component$(() => {
  useStyles$(styles);
  const dati = useSignal();
  const lang = getLocale("en");
  const nome = useSignal('');
  const showDialog = useSignal(false);
  const isEditing = useSignal(false);
  const currentId = useSignal<number | null>(null);
  const addAction = addCliente();
  const editAction = modCliente();
  const formAction = useSignal(addAction);
  const notifications = useSignal<Notification[]>([]); 

  useTask$(async ({ track })=>{
      const query = await useTecnici();
      dati.value = query;
      track(() => isEditing.value);
      // @ts-ignore
      formAction.value = isEditing.value ? editAction : addAction;
  })

  const addNotification = $((message: string, type: 'success' | 'error') => {
      notifications.value = [...notifications.value, { message, type }];
      // Rimuovi la notifica dopo 3 secondi
      setTimeout(() => {
        notifications.value = notifications.value.filter(n => n.message !== message);
      }, 3000);
  });

  const Modify = $((row:any)=>{
    const extractRowData = extractRow(row);
    currentId.value = extractRowData.idcliente;
    nome.value = extractRowData.nomecliente;
    isEditing.value = true;
    showDialog.value = true;
  })

  const reloadTable = $(async () => {
    if (formAction.value.value?.success) 
      addNotification(lang === "en" ? "Record edited successfully" : "Dato modificato con successo", 'success');
    else
      addNotification(lang === "en" ? "Error during editing" : "Errore durante la modifica", 'error');
  })

  const openClientiDialog = $(() => {
    nome.value = '';
    isEditing.value = false;
    showDialog.value = true;
    currentId.value = null;
  })

  const closeClientiDialog = $(() => {
    showDialog.value = false;
  })

  const handleError = $((error: any) => {
    console.log(error);
    addNotification(lang === "en" ? "Error during import" : "Errore durante l'importazione", 'error');
  })

  const handleOk = $(async () => {
    addNotification(lang === "en" ? "Import completed successfully" : "Importazione completata con successo", 'success');
  })

  const handleDeleteRow = $((row : JSON) => {
    console.log(row);
  })
      
    return (
        <>
            <div class="size-full bg-white overflow-hidden lg:px-40 md:px-24 px-0">
              {/* Aggiungi questo div per le notifiche */}
              <div class="fixed top-4 right-4 z-50 space-y-2">
                {notifications.value.map((notification, index) => (
                  <div 
                    key={index}
                    class={`p-4 rounded-md shadow-lg ${
                      notification.type === 'success' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {notification.message}
                  </div>
                ))}
              </div>
        
              <Title haveReturn={true} url={"/"+lang+"/admin/panel"}>{$localize`Admin Panel`}</Title>
              <Table title={$localize`Lista clienti`}>
                <Dati dati={dati.value} title={$localize`Lista clienti`} nomeTabella={$localize`clients`} OnModify={Modify} OnDelete={handleDeleteRow} DBTabella="clienti"></Dati>
                <ButtonAdd nomePulsante={$localize`Aggiungi cliente/i`} onClick$={openClientiDialog}></ButtonAdd>
                <Import nomeImport="clienti" OnError={handleError} OnOk={handleOk}></Import>
              </Table>
            </div>

            {showDialog.value && (
                              <div class="dialog-overlayAdmin openAdmin">
                                <div class="dialog-contentAdmin">
                                <div class="absolute top-4 right-4 cursor-pointer" onClick$={closeClientiDialog}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></div>
                                          <Form action={formAction.value} onSubmit$={reloadTable}>
                                              <h3 class="dialog-titleAdmin">{isEditing.value ? $localize`Modifica tecnico` : $localize`Aggiungi tecnico`}</h3>
                                              <div class="dialog-messageAdmin">
                                                      <hr class="text-neutral-200 mb-4 w-11/12" />
                                                      <div class="w-11/12">
                                                          <input class="opacity-0" id="idC" type="text" name="idcliente" value={currentId.value} />
                                                          <br />
                                                          <TextBoxForm error={formAction.value.value} id="NomeC" placeholder={$localize`Inserire il nome del cliente`} nameT="nome" title={$localize`Nome` + "*"} value={nome.value}></TextBoxForm>
                                                          {formAction.value.value?.failed && formAction.value.value?.fieldErrors.nome && (<div class="text-sm text-red-600 font-semibold ms-32">{lang === "en" ? "Name not valid" : "Nome non valido"}</div>)}
                                                      </div>
                                              </div>
                                              <div class="dialog-actionsAdmin">
                                                  <button
                                                      type='button'
                                                      onClick$={closeClientiDialog}
                                                      class="dialog-buttonAdmin cancelAdmin cursor-pointer"
                                                  >
                                                      {$localize`Annulla`}
                                                  </button>
                                                  <button 
                                                      class="dialog-buttonAdmin text-white bg-green-500 hover:bg-green-600 cursor-pointer"
                                                      type='submit'
                                                  >
                                                      {$localize`Conferma`}
                                                  </button>
                                              </div>
                                          </Form>
                                          </div>
                                      </div>
                          )}
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