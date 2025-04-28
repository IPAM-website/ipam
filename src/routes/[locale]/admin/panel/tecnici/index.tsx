import { component$, getLocale, useSignal, useTask$, $, useStyles$, useVisibleTask$ } from "@builder.io/qwik";
import { DocumentHead, server$, Form, routeAction$, RequestEventAction, zod$, z } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import ButtonAdd from "~/components/table/ButtonAdd";
import TextBoxForm from "~/components/forms/formsComponents/TextboxForm";
import styles from "../dialog.css?inline";
import sql from "~/../db";
import Dati from "~/components/table/Dati_Headers";
import CHKForms from "~/components/forms/CHKForms";
import Import from "~/components/table/ImportCSV";
// import { useNotify } from "~/services/notifications";
import bcrypt from "bcryptjs";

type Notification = {
  message: string;
  type: 'success' | 'error';
};

export interface FilterObject {
  value?: string;
}

export const extractRow = (row: any) => {
  const { idtecnico, nometecnico, cognometecnico, ruolo, emailtecnico, telefonotecnico, pwdtecnico, admin } = row;
  return {
    admin,
    idtecnico,
    nometecnico,
    cognometecnico,
    ruolo,
    emailtecnico,
    telefonotecnico,
    pwdtecnico
  }
}

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

export const searchAdmins = server$(async () => {
  try {
    const query = await sql`SELECT * FROM tecnici WHERE admin=true`
    return query.length > 0;
  }
  catch {
    return false
  }
})

export const modTecnico = routeAction$(async (data, requestEvent: RequestEventAction) => {
  try {
    await sql`
      UPDATE tecnici
      SET nometecnico = ${data.nome}, cognometecnico = ${data.cognome}, ruolo = ${data.ruolo}, emailtecnico = ${data.email}, pwdtecnico = ${bcrypt.hashSync(data.pwd, 12)}, telefonotecnico = ${data.telefono || null}, admin = ${data.admin == "on"}
      WHERE idtecnico = ${data.idtecnico}
    `;
    return {
      success: true,
      message: "Tecnico modificato con successo"
    }
  }
  catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Errore durante l'inserimento del tecnico"
    }
  }
}, zod$({
  admin: z.any(),
  idtecnico: z.string(),
  nome: z.string().min(2),
  cognome: z.string().min(2),
  ruolo: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional(),
  pwd: z.string().min(2)
}))

export const addTecnico = routeAction$(async (data, requestEvent: RequestEventAction) => {
  try {
    await sql`
      INSERT INTO tecnici (nometecnico, cognometecnico, ruolo, emailtecnico, pwdtecnico, telefonotecnico, admin)
      VALUES (${data.nome}, ${data.cognome}, ${data.ruolo}, ${data.email}, ${bcrypt.hashSync(data.pwd, 12)}, ${data.telefono || null}, FALSE)
    `;
    return {
      success: true,
      message: "Tecnico inserito con successo"
    }
  }
  catch (e) {
    console.log(e);
    return {
      success: false,
      message: "Errore durante l'inserimento del tecnico"
    }
  }
}, zod$({
  nome: z.string().min(2),
  cognome: z.string().min(2),
  ruolo: z.string().min(2),
  email: z.string().email(),
  telefono: z.string().optional(),
  pwd: z.string().min(2)
}))

export const deleteRow = server$(async function (this, data) {
  try {

    await sql`DELETE FROM tecnici WHERE tecnici.idtecnico = ${data.idtecnico}`;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
})

export const search = server$(async (data) => {
  try {
    const query = await sql`
      SELECT 
        *
      FROM tecnici
      WHERE nometecnico LIKE ${data.filter}
      OR cognometecnico LIKE ${data.filter}
      OR ruolo LIKE ${data.filter}
      OR emailtecnico LIKE ${data.filter}
      OR telefonotecnico LIKE ${data.filter}
      OR pwdtecnico LIKE ${data.filter}
    `;
    return query;
  } catch (e) {
    console.log(e);
    return [];
  }
})


export default component$(() => {
  useStyles$(styles);
  // const notify = useNotify();
  const admin = useSignal(false);
  const nome = useSignal('');
  const cognome = useSignal('');
  const ruolo = useSignal('');
  const mail = useSignal('');
  const telefono = useSignal('');
  const password = useSignal('');
  const showDialog = useSignal(false);
  const dati = useSignal();
  const lang = getLocale("en");
  const isEditing = useSignal(false);
  const currentId = useSignal<number | null>(null);
  const addAction = addTecnico();
  const editAction = modTecnico();
  const formAction = useSignal(addAction);
  const reloadFN = useSignal<(() => void) | null>(null);
  const notifications = useSignal<Notification[]>([]);
  const filter = useSignal<FilterObject>({ value: '' });
  const txtQuickSearch = useSignal<HTMLInputElement | undefined>(undefined);

  const lastAdmin = useSignal<boolean>(false);

  useTask$(async ({ track }) => {
    const query = await useTecnici();
    dati.value = query;
    track(() => isEditing.value);
    //@ts-ignore
    formAction.value = isEditing.value ? editAction : addAction;
    lastAdmin.value = await searchAdmins();
  })


  const openTeniciDialog = $(() => {
    nome.value = '';
    cognome.value = '';
    ruolo.value = '';
    mail.value = '';
    telefono.value = '';
    password.value = '';
    currentId.value = null;
    isEditing.value = false;
    showDialog.value = true;
  });

  const closeTecniciDialog = $(() => {
    showDialog.value = false;
  });

  const addNotification = $((message: string, type: 'success' | 'error') => {
    notifications.value = [...notifications.value, { message, type }];
    // Rimuovi la notifica dopo 3 secondi
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.message !== message);
    }, 3000);
  });

  const reloadTable = $(() => {
    reloadFN.value?.();
    if (formAction.value.value?.success) {
      reloadFN.value?.();
      closeTecniciDialog();
      addNotification(lang === "en" ? "Record edited successfully" : "Dato modificato con successo", 'success');
    }
    else
      addNotification(lang === "en" ? "Error during editing" : "Errore durante la modifica", 'error');
  })

  const Modify = $((row: any) => {
    const extractRowData = extractRow(row);
    nome.value = extractRowData.nometecnico;
    cognome.value = extractRowData.cognometecnico;
    ruolo.value = extractRowData.ruolo;
    mail.value = extractRowData.emailtecnico;
    telefono.value = extractRowData.telefonotecnico;
    password.value = extractRowData.pwdtecnico;
    currentId.value = extractRowData.idtecnico;
    admin.value = extractRowData.admin;
    isEditing.value = true;
    showDialog.value = true;
  })



  const Delete = $(async (row: any) => {
    if (await deleteRow(extractRow(row)))
      addNotification(lang === "en" ? "Record deleted successfully" : "Dato eliminato con successo", 'success');
    else
      addNotification(lang === "en" ? "Error during deleting" : "Errore durante la eliminazione", 'error');
  })


  const handleError = $((error: any) => {
    console.log(error);
    addNotification(lang === "en" ? "Error during import" : "Errore durante l'importazione", 'error');
  })

  const handleOk = $(async () => {
    addNotification(lang === "en" ? "Import completed successfully" : "Importazione completata con successo", 'success');
  })

  const getREF = $((reloadFunc: () => void) => { reloadFN.value = reloadFunc; })

  const reload = $(async () => {
    if (filter.value.value !== "") {
      const query = await search({ filter: `%${filter.value.value}%` });
      return query;
    }
    else
      return await useTecnici();
  })

  const dff = $((r: any) => !r.admin);

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
        <Table title={$localize`Lista tecnici`}>
          <TextBoxForm id="txtfilter" value={filter.value.value} ref={txtQuickSearch} placeholder={$localize`Ricerca rapida`} OnInput$={(e) => {
            filter.value.value = (e.target as HTMLInputElement).value;
            if (reloadFN)
              reloadFN.value?.();
          }} />
          <Dati dati={dati.value} title={$localize`Lista tecnici`} nomeTabella={$localize`technicians`} OnModify={Modify} OnDelete={Delete} onReloadRef={getREF} DBTabella="tecnici" deleteWhen={dff} funcReloadData={reload}></Dati>
          <ButtonAdd nomePulsante={$localize`Inserisci tecnico`} onClick$={openTeniciDialog}></ButtonAdd>
          <Import nomeImport="tecnici" OnError={handleError} OnOk={handleOk}></Import>
        </Table>
      </div>

      {showDialog.value && (
        <div class="dialog-overlayAdmin openAdmin">
          <div class="dialog-contentAdmin">
            <div class="absolute top-4 right-4 cursor-pointer" onClick$={closeTecniciDialog}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></div>
            <Form action={formAction.value} onSubmit$={reloadTable}>
              <h3 class="dialog-titleAdmin">{isEditing.value ? $localize`Modifica tecnico` : $localize`Aggiungi tecnico`}</h3>
              <div class="dialog-messageAdmin">
                <hr class="text-neutral-200 mb-4 w-11/12" />
                <div class="w-11/12">
                  <input class="opacity-0" id="idT" type="text" name="idtecnico" value={currentId.value} />
                  {!lastAdmin.value && <CHKForms id="chkT" name="admin" value={admin.value} nameCHK="Admin"></CHKForms>}
                  <br />
                  <TextBoxForm error={formAction.value.value} id="NomeT" placeholder={$localize`Inserire il nome del tecnico`} nameT="nome" title={$localize`Nome` + "*"} value={nome.value}></TextBoxForm>
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.nome && (<div class="text-sm text-red-600 font-semibold ms-32">{lang === "en" ? "Name not valid" : "Nome non valido"}</div>)}
                  <TextBoxForm error={formAction.value.value} id="CognomeT" placeholder={$localize`Inserire il cognome del tecnico`} nameT="cognome" title={$localize`Cognome` + "*"} value={cognome.value}></TextBoxForm>
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.cognome && (<div class="text-sm text-red-600 font-semibold ms-32">{lang === "en" ? "Surname not valid" : "Cognome non valido"}</div>)}
                  <TextBoxForm error={formAction.value.value} id="RuoloT" placeholder={$localize`Inserire il ruolo del tecnico`} nameT="ruolo" title={$localize`Ruolo` + "*"} value={ruolo.value}></TextBoxForm>
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.ruolo && (<div class="text-sm text-red-600 font-semibold ms-32">{lang === "en" ? "Role not valid" : "Ruolo non valido"}</div>)}
                  <TextBoxForm error={formAction.value.value} id="EmailT" placeholder={$localize`Inserire la mail del tecnico`} nameT="email" title={$localize`Email` + "*"} value={mail.value}></TextBoxForm>
                  {formAction.value.value?  .failed && formAction.value.value?.fieldErrors.email && (<div class="text-sm text-red-600 font-semibold ms-32">{formAction.value.value?.fieldErrors.email}</div>)}
                  <TextBoxForm id="TelefonoT" placeholder={$localize`Inserire il telefono del tecnico`} nameT="telefono" title={$localize`Telefono`} value={telefono.value}></TextBoxForm>
                  <TextBoxForm error={formAction.value.value} id="PwdT" placeholder={$localize`Inserire la password del tecnico`} nameT="pwd" title={$localize`Password` + "*"} value={password.value}></TextBoxForm>
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.pwd && (<div class="text-sm text-red-600 font-semibold ms-32">{lang === "en" ? "Password not valid" : "Password non valido"}</div>)}
                </div>
              </div>
              <div class="dialog-actionsAdmin">
                <button
                  type='button'
                  onClick$={closeTecniciDialog}
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
  title: "Gesione tecnici",
  meta: [
    {
      name: "Gestione tecnici",
      content: "Pagina dell'admin per la gestione dei tecnici",
    },
  ],
};