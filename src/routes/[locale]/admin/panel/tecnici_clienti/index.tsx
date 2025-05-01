import { $, component$, getLocale, useSignal, useStyles$, useTask$ } from "@builder.io/qwik";
import { DocumentHead, Form, RequestEventAction, routeAction$, server$, useLocation, z, zod$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import SelectForm from "~/components/forms/formsComponents/SelectForm";
import TextBoxForm from "~/components/forms/formsComponents/TextboxForm";
import styles from "../dialog.css?inline";
import Import from "~/components/table/ImportCSV";
import sql from "~/../db";
import { ClienteModel } from "~/dbModels";
import bcrypt from "bcryptjs"

// Aggiungi questo tipo per la notifica
type Notification = {
  message: string;
  type: 'success' | 'error';
};

export interface FilterObject {
  value ?: string;
}

export interface TableModel {
  nomeucliente: string;
  cognomeucliente: string;
  emailucliente: string;
  pwducliente: string;
}

export const extractRow = (row: any) => {
  console.log(row);
  const { iducliente, nomeucliente, cognomeucliente, emailucliente, nomecliente, idcliente } = row;
  return {
    iducliente,
    nomeucliente,
    cognomeucliente,
    emailucliente,
    nomecliente,
    idcliente
  }
}

export const deleteRow = server$(async function (this, data) {
  console.log(data);
  try {
    await sql`DELETE FROM usercliente WHERE usercliente.iducliente = ${data.iducliente}`;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
})

export const useUserCliente = server$(async () => {
  try {
    const query = await sql`SELECT usercliente.iducliente, usercliente.nomeucliente, usercliente.cognomeucliente, usercliente.emailucliente, usercliente.pwducliente, clienti.nomecliente, clienti.idcliente FROM usercliente, clienti WHERE usercliente.idcliente = clienti.idcliente`;
    //console.log(query);
    return query;
  }
  catch {
    return {
      errore: "SI"
    }
  }
})

export const modUserCliente = routeAction$(async (data, requestEvent: RequestEventAction) => {
  try {
    console.log(data);
    if (data.idcliente != undefined && data.idcliente != null && data.idcliente != '' && parseInt(data.idcliente) != 0) {
      await sql`UPDATE usercliente SET nomeucliente = ${data.nome}, cognomeucliente = ${data.cognome}, emailucliente = ${data.email}, idcliente = ${parseInt(data.idcliente)} WHERE iducliente = ${data.iducliente}`;
    }
    else
      await sql`UPDATE usercliente SET nomeucliente = ${data.nome}, cognomeucliente = ${data.cognome}, emailucliente = ${data.email} WHERE iducliente = ${data.iducliente}`;
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
}, zod$({
  iducliente: z.string(),
  idcliente: z.string().optional(),
  nome: z.string().min(2),
  cognome: z.string().min(2),
  email: z.string().email()
}))

export const addUserCliente = routeAction$(async (data, requestEvent: RequestEventAction) => {
  try {
    if (data.idcliente != undefined && data.idcliente != null && parseInt(data.idcliente) != 0 && data.idcliente != '') {
      await sql`INSERT INTO usercliente (nomeucliente, cognomeucliente, emailucliente, pwducliente, idcliente) VALUES (${data.nome}, ${data.cognome}, ${data.email}, ${bcrypt.hashSync(data.pwd, 12)}, ${data.idcliente})`;
    }
    else{
      console.log(data);
      await sql`INSERT INTO usercliente (nomeucliente, cognomeucliente, emailucliente, pwducliente) VALUES (${data.nome}, ${data.cognome}, ${data.email}, ${bcrypt.hashSync(data.pwd, 12)})`;
    }
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
}, zod$({
  idcliente: z.string().optional(),
  nome: z.string().min(2),
  cognome: z.string().min(2),
  email: z.string().email(),
  pwd: z.string().min(2),
}))

export const listaClienti = server$(async function (this) {
  try {
    const query = await sql`SELECT * FROM clienti`;
    return query as unknown as ClienteModel[];
  }
  catch (e) {
    console.log(e);
    return [];
  }
})

export const listaClientiExcept = server$(async (data) => {
  try {
    console.log(data);
    const query = await sql`SELECT * FROM clienti WHERE idcliente != ${data.idcliente}`;
    return query as unknown as ClienteModel[];
  }
  catch (e) {
    console.log(e);
    return [];
  }
})

export const search = server$(async (data) => {
  try {
    const query = await sql`
      SELECT 
        usercliente.iducliente, 
        usercliente.nomeucliente, 
        usercliente.cognomeucliente, 
        usercliente.emailucliente, 
        usercliente.pwducliente, 
        clienti.nomecliente
      FROM usercliente
      JOIN clienti ON usercliente.idcliente = clienti.idcliente
      WHERE (
        usercliente.nomeucliente   LIKE ${data.filter}
        OR usercliente.cognomeucliente LIKE ${data.filter}
        OR usercliente.emailucliente   LIKE ${data.filter}
        OR clienti.nomecliente         LIKE ${data.filter}
      )
    `;
    return query;
  } catch (e) {
    console.log(e);
    return [];
  }
})

export default component$(() => {
  useStyles$(styles);
  const dati = useSignal();
  const lang = getLocale("en");
  const nome = useSignal('');
  const cognome = useSignal('');
  const email = useSignal('');
  const password = useSignal('');
  const showDialog = useSignal(false);
  const isEditing = useSignal(false);
  const currentIdC = useSignal<string | number | null>(null);
  const addAction = addUserCliente();
  const editAction = modUserCliente();
  const formAction = useSignal(addAction);
  // Aggiungi questo stato per le notifiche
  const notifications = useSignal<Notification[]>([]);
  const reloadFN = useSignal<(() => void) | null>(null);
  const currentTecnico = useSignal<number | null>(null);
  const clientList = useSignal<ClienteModel[]>([]);
  const currentIdUC = useSignal<string | number | null>(null);
  const filter = useSignal<FilterObject>({ value: '' });
  const txtQuickSearch = useSignal<HTMLInputElement | undefined>(undefined);

  useTask$(async ({ track }) => {
    const query = await useUserCliente();
    dati.value = query;
    track(() => isEditing.value);
    // @ts-ignore
    formAction.value = isEditing.value ? editAction : addAction;
    //console.log(clientList.value);
  })

  const clients = $(async () => {
    if(isEditing.value)
      clientList.value = await listaClienti();
    else
      clientList.value = await listaClientiExcept({ idcliente: currentIdC.value });
  })

  // Funzione per aggiungere una notifica
  const addNotification = $((message: string, type: 'success' | 'error') => {
    notifications.value = [...notifications.value, { message, type }];
    // Rimuovi la notifica dopo 3 secondi
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.message !== message);
    }, 3000);
  });

  const Modify = $(async (row: any) => {

    const extractRowData = extractRow(row);
    console.log(extractRowData);
    nome.value = extractRowData.nomeucliente;
    cognome.value = extractRowData.cognomeucliente;
    email.value = extractRowData.emailucliente;
    currentIdUC.value = extractRowData.iducliente;
    isEditing.value = true;
    showDialog.value = true;
    currentIdC.value = extractRowData.idcliente;
    console.log(currentIdC.value);
    clientList.value = await listaClientiExcept({ idcliente: currentIdC.value });
  })


  const Delete = $(async (row: any) => {
    //console.log(extractRow(row));
    if (await deleteRow(extractRow(row)))
      addNotification(lang === "en" ? "Deleted successfully" : "Eliminato con successo", 'success');
    else
      addNotification(lang === "en" ? "Error during deletion" : "Errore durante l'eliminazione", 'error');
  })

  const reloadTable = $(() => {
    if (formAction.value.value?.success) {
      addNotification(lang === "en" ? "Record added successfully" : "Dato aggiunto con successo", 'success');
      showDialog.value = false;
      isEditing.value = false;
      reloadFN.value?.();
    }
    else
      addNotification(lang === "en" ? "Error during adding" : "Errore durante l'aggiunta", 'error');
  })

  const openClientiDialog = $(async () => {
    nome.value = '';
    cognome.value = '';
    email.value = '';
    password.value = '';
    isEditing.value = false;
    showDialog.value = true;
    currentIdC.value = null;
    currentTecnico.value = null;
    if(!isEditing.value)
      clientList.value = await listaClienti();
    else
      clientList.value = await listaClientiExcept({ idcliente: currentIdC.value });
  })

  const closeClientiDialog = $(() => {
    showDialog.value = false;
  })

  const handleError = $((error: any) => {
    console.log(error);
    addNotification(lang === "en" ? "Error during import" : "Errore durante l'importazione", 'error');
  })

  const handleOkay = $(() => {
    addNotification(lang === "en" ? "Import completed successfully" : "Importazione completata con successo", 'success');
  })

  const reload = $(async () => {
    if (filter.value.value != '') {
      const query = await search({ filter: `%${filter.value.value}%` });
      //console.log(query);
      return query;
    }
    else
      return await useUserCliente();
  })

  const reload2 = $(async (e: any) => {
    reloadFN.value = e;
  })

  return (
    <>
      <div class="size-full bg-white overflow-hidden lg:px-40 md:px-24 px-0">
        {/* Aggiungi questo div per le notifiche */}
        <div class="fixed top-4 right-4 z-50 space-y-2">
          {notifications.value.map((notification, index) => (
            <div
              key={index}
              class={`p-4 rounded-md shadow-lg ${notification.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                }`}
            >
              {notification.message}
            </div>
          ))}
        </div>

        <Title haveReturn={true} url={"/" + lang + "/admin/panel"}>{$localize`Admin Panel`}</Title>
        <Table title={$localize`Lista relazioni`}>
          <TextBoxForm id="txtfilter" value={filter.value.value} ref={txtQuickSearch} placeholder={$localize`Ricerca rapida`} OnInput$={(e) => {
            filter.value.value = (e.target as HTMLInputElement).value;
            if (reloadFN)
              reloadFN.value?.();
          }} />
          <Dati dati={dati.value} title={$localize`Lista relazioni`} nomeTabella={$localize`relations`} OnModify={Modify} OnDelete={Delete} DBTabella="usercliente" onReloadRef={reload2} funcReloadData={reload}></Dati>
          <ButtonAdd nomePulsante={$localize`Aggiungi relazione/i`} onClick$={openClientiDialog}></ButtonAdd>
          <Import nomeImport="usercliente" OnError={handleError} OnOk={handleOkay}></Import>
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
                  <input type="hidden" name="idcliente" id="idC" value={currentIdC.value} />
                  <input type="hidden" name="iducliente" id="idUC" value={currentIdUC.value} />
                  <br />
                  <SelectForm value="" OnClick$={(e) => { (document.getElementsByName("idcliente")[0] as HTMLInputElement).value = (e.target as HTMLOptionElement).value }} id="idUC" name="idcliente" title="Cliente" listName="">
                    {!isEditing.value && <option value="0" selected>{$localize`No selected`}</option>}
                    {clientList.value && clientList.value?.map((row: any) => {
                      return (
                        <option value={row.idcliente}>{row.nomecliente}</option>
                      )
                    })}
                  </SelectForm>
                  <TextBoxForm error={formAction.value.value} id="NomeCU" placeholder={$localize`Inserire il nome dell'utente`} nameT="nome" title={$localize`Nome` + "*"} value={nome.value}></TextBoxForm>
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.nome && (<div class="text-sm text-red-600 font-semibold ms-32">{lang === "en" ? "Name not valid" : "Nome non valido"}</div>)}
                  <TextBoxForm error={formAction.value.value} id="CognomeCU" placeholder={$localize`Inserire il cognome dell'utente`} nameT="cognome" title={$localize`Cognome` + "*"} value={cognome.value}></TextBoxForm>
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.cognome && (<div class="text-sm text-red-600 font-semibold ms-32">{lang === "en" ? "Surname not valid" : "Cognome non valido"}</div>)}
                  <TextBoxForm error={formAction.value.value} id="EmailCU" placeholder={$localize`Inserire la mail dell'utente`} nameT="email" title={$localize`Email` + "*"} value={email.value}></TextBoxForm>
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.email && (<div class="text-sm text-red-600 font-semibold ms-32">{formAction.value.value?.fieldErrors.email}</div>)}
                  {!isEditing.value && <TextBoxForm error={formAction.value.value} id="PwdT" placeholder={$localize`Inserire la password dell'uente`} nameT="pwd" title={$localize`Password` + "*"} value={password.value}></TextBoxForm>}
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.pwd && (<div class="text-sm text-red-600 font-semibold ms-32">{lang === "en" ? "Password not valid" : "Password non valido"}</div>)}
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