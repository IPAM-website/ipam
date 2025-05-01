import { $, component$, getLocale, useSignal, useStyles$, useTask$ } from "@builder.io/qwik";
import { DocumentHead, Form, RequestEventAction, routeAction$, server$, useLocation, z, zod$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import adminSelect from "~/components/forms/adminSelect";
import TextBoxForm from "~/components/forms/formsComponents/TextboxForm";
import styles from "../dialog.css?inline";
import Import from "~/components/table/ImportCSV";
import sql from "~/../db";
import AdminSelect from "~/components/forms/adminSelect";
import clienti from "../clienti";

// Aggiungi questo tipo per la notifica
type Notification = {
  message: string;
  type: 'success' | 'error';
};

export interface TableModel {
  idtecnico: number;
  idcliente: number;
  nometecnico: string;
  nomecliente: string;
}

export const extractRow = (row: any) => {
  const { idtecnico, nometecnico, idcliente, nomecliente } = row;
  return {
    idtecnico,
    idcliente,
    nometecnico,
    nomecliente
  }
}

export const useReload = server$(async function () {
  //.log("Reloading data...");
  try {
    const query = await sql`SELECT cliente_tecnico.idcliente, cliente_tecnico.data_assegnazione, cliente_tecnico.idtecnico, tecnici.nometecnico, clienti.nomecliente FROM Cliente_Tecnico, tecnici, clienti WHERE Cliente_Tecnico.idtecnico = tecnici.idtecnico AND Cliente_Tecnico.idcliente = clienti.idcliente ORDER BY cliente_tecnico.idtecnico`;
    //console.log(query);
    return query;
  }
  catch {
    return {
      errore: "SI"
    }
  }
})

export const deleteRow = server$(async function(this,data){
  try{
    // console.log(data);
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
    const query = await sql`SELECT cliente_tecnico.idcliente, cliente_tecnico.data_assegnazione, cliente_tecnico.idtecnico, tecnici.nometecnico, clienti.nomecliente FROM Cliente_Tecnico, tecnici, clienti WHERE Cliente_Tecnico.idtecnico = tecnici.idtecnico AND Cliente_Tecnico.idcliente = clienti.idcliente ORDER BY cliente_tecnico.idtecnico`;
    //console.log(query);
    return query;
  }
  catch {
    return {
      errore: "SI"
    }
  }
})

export const modCliente = routeAction$(async (data, requestEvent : RequestEventAction) => {
  try
  {
    // console.log(data);
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
    // console.log(data);
    await sql`
      INSERT INTO cliente_tecnico (idcliente, idtecnico, data_assegnazione)
      VALUES (${data.idcliente}, ${data.idtecnico}, ${new Date().toISOString()})
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
  idcliente: z.string(),
  idtecnico: z.string()
}))

export const clientList = server$(async function (this, idTecnico?: number) {
  try {
    // If idTecnico is provided, get clients not associated with this technician
    if (idTecnico) {
      const query = await sql`
        SELECT * FROM clienti 
        WHERE idcliente NOT IN (
          SELECT idcliente FROM cliente_tecnico 
          WHERE idtecnico = ${idTecnico}
        )
      `;
      return query;
    } 
    // Otherwise return all clients
    else {
      const query = await sql`SELECT * FROM clienti`;
      return query;
    }
  }
  catch (e) {
    console.log(e);
    return {
      errore: "SI"
    }
  }
})

export const tecniciList = server$(async function (this) {
  try {
    const query = await sql`SELECT * FROM tecnici`;
    return query;
  }
  catch (e) {
    console.log(e);
    return {
      errore: "SI"
    }
  }
})

export const addRelazione = routeAction$(async (data) => {
  try {
    // console.log("Aggiunta relazione:", data);
    // Inserisci la nuova relazione tra tecnico e cliente
    await sql`
      INSERT INTO cliente_tecnico (idtecnico, idcliente, data_assegnazione)
      VALUES (${data.idtecnico}, ${data.idcliente}, NOW())
    `;
    return {
      success: true,
      message: "Relazione inserita con successo"
    }
  }
  catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Errore durante l'inserimento della relazione"
    }
  }
}, zod$({
  idtecnico: z.string().min(1),
  idcliente: z.string().min(1)
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
  const currentIDT = useSignal<number | null>(null);
  // Aggiungi questo stato per le notifiche
  const notifications = useSignal<Notification[]>([]);
  const reloadFN = useSignal<(() => void) | null>(null);
  const listSelect = useSignal<any>([]);
  const currentTecnico = useSignal<number | null>(null);
  const listSelectTecnici = useSignal<any>([]);
  const addRelazioneAction = addRelazione();

  useTask$(async ({ track })=>{
      const query = await useTecnici();
      dati.value = query;
      track(() => isEditing.value);
      // @ts-ignore
      formAction.value = isEditing.value ? editAction : addAction;
      
      // Track changes to currentTecnico and update client list accordingly
      track(() => currentTecnico.value);
      if (currentTecnico.value) {
        listSelect.value = await clientList(currentTecnico.value);
      } else {
        listSelect.value = await clientList();
      }

      // Carica i tecnici all'avvio
      listSelectTecnici.value = await tecniciList();
  })

  // Funzione per aggiungere una notifica
  const addNotification = $((message: string, type: 'success' | 'error') => {
    notifications.value = [...notifications.value, { message, type }];
    // Rimuovi la notifica dopo 3 secondi
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.message !== message);
    }, 3000);
  });

  const Modify = $((row:any)=>{
    const extractRowData = extractRow(row);
    // console.log(extractRowData);
    currentId.value = extractRowData.idtecnico;
    nome.value = extractRowData.nometecnico;
    currentTecnico.value = extractRowData.idtecnico;
    isEditing.value = true;
    showDialog.value = true;
  })


  const Delete =$(async (row:any)=>{
    if(await deleteRow(extractRow(row)))
      addNotification(lang === "en" ? "Deleted successfully" : "Eliminato con successo", 'success');
    else
      addNotification(lang === "en" ? "Error during deletion" : "Errore durante l'eliminazione", 'error');
  })

  const reloadTable = $(() => {
    if (formAction.value.value?.success){
      addNotification(lang === "en" ? "Record added successfully" : "Dato aggiunto con successo", 'success');  
      showDialog.value = false;
      isEditing.value = false;
    }
    else
      addNotification(lang === "en" ? "Error during adding" : "Errore durante l'aggiunta", 'error');
  })

  const openClientiDialog = $(() => {
    nome.value = '';
    isEditing.value = false;
    showDialog.value = true;
    currentId.value = null;
    currentTecnico.value = null;
    // Usa l'azione di aggiunta relazione
    formAction.value = addRelazioneAction;
  })

  const closeClientiDialog = $(() => {
    showDialog.value = false;
  })

  const handleError = $((error: any) => {
    console.log(error);
    addNotification(lang === "en" ? "Error during import" : "Errore durante l'importazione", 'error');
  })

  const handleOkay = $(() => {
    console.log("ok");
    addNotification(lang === "en" ? "Import completed successfully" : "Importazione completata con successo", 'success');
  })

  const reloadData = $(async () => {
    return await useReload();
  })

  const clienteSelezionato = $((event: any) => {
    currentId.value = event.target.value;
  })

  // Funzione per aggiornare il tecnico selezionato e ricaricare la lista clienti
  const tecnicoSelezionato = $(async (event: any) => {
    currentTecnico.value = parseInt(event.target.value);
    nome.value = event.target.text || event.target.value;
    listSelect.value = await clientList(currentTecnico.value);
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
        <Table title={$localize`Lista relazioni`}>
          <Dati dati={dati.value} title={$localize`Lista relazioni`} nomeTabella={$localize`relations`} OnModify={Modify} OnDelete={Delete} DBTabella="cliente_tecnico" funcReloadData={reloadData} noModify="si"></Dati>
          <ButtonAdd nomePulsante={$localize`Aggiungi relazione/i`} onClick$={openClientiDialog}></ButtonAdd>
          <Import nomeImport="cliente_tecnico" OnError={handleError} OnOk={handleOkay}></Import>
        </Table>
      </div>

      {showDialog.value && (
        <div class="dialog-overlayAdmin openAdmin">
          <div class="dialog-contentAdmin">
            <div class="absolute top-4 right-4 cursor-pointer" onClick$={closeClientiDialog}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </div>
            <Form action={formAction.value} onSubmit$={reloadTable}>
              <h3 class="dialog-titleAdmin">{isEditing.value ? $localize`Modifica tecnico` : $localize`Aggiungi tecnico`}</h3>
              <div class="dialog-messageAdmin">
                <hr class="text-neutral-200 mb-4 w-11/12" />
                <div class="w-11/12">
                  <input class="opacity-0" id="idC" type="text" name="idcliente" value={currentId.value} />
                  <input class="opacity-0" id="idT" type="text" name="idtecnico" value={currentTecnico.value} />
                  {/* Campo nascosto per passare il nome del tecnico al form */}
                  <input class="opacity-0" id="nomeHidden" type="text" name="nome" value={nome.value} />
                  <br />
                  {/* Mostra il selettore tecnici solo in modalità aggiunta, non in modalità modifica */}
                  {isEditing.value ? (
                    <TextBoxForm placeholder="" error={formAction.value.value} id="NomeT" disabled='si' nameT="nome" title={$localize`Tecnico`} value={nome.value}></TextBoxForm>
                  ) : (
                    <AdminSelect 
                      id="idT" 
                      name={$localize`Tecnico`} 
                      value={currentTecnico.value?.toString() || ""} 
                      OnClick$={tecnicoSelezionato} 
                      listName={$localize`Lista Tecnici`}
                    >
                      {/* Genera le opzioni dai dati di listSelectTecnici */}
                      {listSelectTecnici.value && listSelectTecnici.value.length > 0 ? (
                        listSelectTecnici.value.map((tecnico: any) => (
                          <option key={tecnico.idtecnico} value={tecnico.idtecnico}>{tecnico.nometecnico}</option>
                        ))
                      ) : (
                        <option value="">{$localize`Nessun tecnico disponibile`}</option>
                      )}
                    </AdminSelect>
                  )}
                  <AdminSelect 
                    id="idC" 
                    name={$localize`Cliente`} 
                    value={currentId.value?.toString() || ""} 
                    OnClick$={clienteSelezionato} 
                    listName={$localize`Lista Clienti`}
                  >
                    {/* Genera le opzioni dai dati di listSelect */}
                    {listSelect.value && listSelect.value.length > 0 ? (
                      listSelect.value.map((client: any) => (
                        <option key={client.idcliente} value={client.idcliente}>{client.nomecliente}</option>
                      ))
                    ) : (
                      <option value="">{$localize`Nessun cliente disponibile`}</option>
                    )}
                  </AdminSelect>
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
  title: "Gesione clienti e tecnici",
  meta: [
    {
      name: "Gestione clienti e tecnici",
      content: "Pagina dell'admin per la gestione dei clienti e tecnici",
    },
  ],
};