import { $, component$, getLocale, useSignal, useStyles$, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$, server$, z, zod$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import SelectForm from "~/components/form/formComponents/SelectForm";
import TextBoxForm from "~/components/form/formComponents/TextboxForm";
import styles from "../dialog.css?inline";
import Import from "~/components/table/ImportCSV";
import sql from "~/../db";
import type { ClienteModel } from "~/dbModels";
import bcrypt from "bcryptjs"
import PopupModal from "~/components/ui/PopupModal";
import BtnInfoTable from "~/components/table/btnInfoTable";
import TableInfoCSV from "~/components/table/tableInfoCSV";
import { inlineTranslate } from "qwik-speak";
import { getUser } from "~/fnUtils";

// Aggiungi questo tipo per la notifica
type Notification = {
  message: string;
  type: "success" | "error" | "loading";
};

export interface FilterObject {
  value?: string;
}

export interface TableModel {
  nomeucliente: string;
  cognomeucliente: string;
  emailucliente: string;
  pwducliente: string;
}

export const extractRow = (row: any) => {
  // console.log(row);
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
  // console.log(data);
  try {
    await sql`DELETE FROM usercliente WHERE usercliente.iducliente = ${data.iducliente}`;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
})

export const getUserCliente = server$(async () => {
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

export const useModUserCliente = routeAction$(async (data) => {
  try {
    // console.log(data);
    if (data.idcliente && data.idcliente != '' && parseInt(data.idcliente) != 0) {
      await sql`UPDATE usercliente SET nomeucliente = ${data.nome}, cognomeucliente = ${data.cognome}, emailucliente = ${data.email}, idcliente = ${parseInt(data.idcliente)} WHERE iducliente = ${data.iducliente}`;
      return {
        success: true,
        message: "Cliente modificato con successo"
      }
    }
    else
      throw new Error("ID cliente non valido");
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

export const useAddUserCliente = routeAction$(async (data) => {
  try {
    if (data.idcliente && parseInt(data.idcliente) != 0 && data.idcliente != '') {
      await sql`INSERT INTO usercliente (nomeucliente, cognomeucliente, emailucliente, pwducliente, idcliente) VALUES (${data.nome}, ${data.cognome}, ${data.email}, ${bcrypt.hashSync(data.pwd, 12)}, ${data.idcliente})`;
      return {
        success: true,
        message: "Cliente inserito con successo"
      }
    }
    else {
      throw new Error("ID cliente non valido");
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
    // console.log(data);
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

export const insertRow = server$(async (data: string[][]) => {
  try {
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const [nomeuclienteRow, cognomeuclienteRow, emailuclienteRow, pwduclienteRow, nomeClienteRow] = row;
      //console.log(nomeucliente, cognomeucliente, emailucliente, pwducliente, idcliente)
      const nomeucliente = nomeuclienteRow.replace(/^"|"$/g, '').trim();
      const cognomeucliente = cognomeuclienteRow.replace(/^"|"$/g, '').trim();
      const emailucliente = emailuclienteRow.replace(/^"|"$/g, '').trim();
      const pwducliente = pwduclienteRow.replace(/^"|"$/g, '').trim();
      const nomecliente = nomeClienteRow.replace(/^"|"$/g, '').trim();

      //Ricerca idcliente
      const idcliente = await sql`SELECT idcliente FROM clienti WHERE nomecliente = ${nomecliente}`;
      if (idcliente.length == 0)
        throw new Error("Cliente non trovato");
      console.log(idcliente[0].idcliente)

      const user = await getUser()
      await sql.begin(async (tx) => {
        await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
        await tx`
          INSERT INTO usercliente 
            (nomeucliente, cognomeucliente, emailucliente, pwducliente, idcliente) 
          VALUES 
            (${nomeucliente}, ${cognomeucliente}, ${emailucliente}, ${bcrypt.hashSync(pwducliente, 12)}, ${parseInt(idcliente[0].idcliente)})
        `;
      })
    }
    return {
      success: true,
      "it": {
        message: "Utente inserito con successo"
      },
      "en": {
        message: "User inserted successfully"
      }
    }
  }
  catch (e) {
    console.log(e);
    return {
      success: false,
      "it": {
        message: "Errore durante l'inserimento del cliente: " + e
      },
      "en": {
        message: "Error during user insertion: " + e
      }
    }
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
  const addAction = useAddUserCliente();
  const editAction = useModUserCliente();
  const formAction = useSignal(addAction);
  // Aggiungi questo stato per le notifiche
  const notifications = useSignal<Notification[]>([]);
  const reloadFN = useSignal<(() => void) | null>(null);
  const currentTecnico = useSignal<number | null>(null);
  const clientList = useSignal<ClienteModel[]>([]);
  const currentIdUC = useSignal<string | number | null>(null);
  const filter = useSignal<FilterObject>({ value: '' });
  const txtQuickSearch = useSignal<HTMLInputElement | undefined>(undefined);
  const showPreview = useSignal(false);

  useTask$(async ({ track }) => {
    const query = await getUserCliente();
    dati.value = query;
    track(() => isEditing.value);
    // @ts-ignore
    formAction.value = isEditing.value ? editAction : addAction;
    //console.log(clientList.value);
  })

  // const clients = $(async () => {
  //   if (isEditing.value)
  //     clientList.value = await listaClienti();
  //   else
  //     clientList.value = await listaClientiExcept({ idcliente: currentIdC.value });
  // })

  // Funzione per aggiungere una notifica
  const addNotification = $((message: string, type: "success" | "error" | "loading") => {
    notifications.value = [...notifications.value, { message, type }];
    if (type !== "loading") {
      setTimeout(() => {
        notifications.value = notifications.value.filter((n) => n.message !== message);
      }, 4000);
    }
  });

  const Modify = $(async (row: any) => {

    const extractRowData = extractRow(row);
    // console.log(extractRowData);
    nome.value = extractRowData.nomeucliente;
    cognome.value = extractRowData.cognomeucliente;
    email.value = extractRowData.emailucliente;
    currentIdUC.value = extractRowData.iducliente;
    isEditing.value = true;
    showDialog.value = true;
    currentIdC.value = extractRowData.idcliente;
    // console.log(currentIdC.value);
    clientList.value = await listaClientiExcept({ idcliente: currentIdC.value });
  })


  const Delete = $(async (row: any) => {
    //console.log(extractRow(row));
    addNotification("Eliminazione in corso...", "loading");
    if (await deleteRow(extractRow(row))) {
      addNotification(lang === "en" ? "Deleted successfully" : "Eliminato con successo", 'success');
      notifications.value = notifications.value.filter(n => n.type !== "loading");
    }
    else {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Error during deletion" : "Errore durante l'eliminazione", 'error');
    }
  })

  const reloadTable = $(() => {
    if (formAction.value.value?.success) {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Record added successfully" : "Dato aggiunto con successo", 'success');
      showDialog.value = false;
      isEditing.value = false;
      reloadFN.value?.();
    }
    else {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Error during adding" : "Errore durante l'aggiunta", 'error');
    }
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!isEditing.value)
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

  const handleOkay = $(async (data: any) => {
    addNotification("Operazione in corso...", "loading");
    try {
      const result = await insertRow(data);
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      if(result.success){
        if (lang === 'it' || lang === 'en') {
          addNotification(result[lang].message, 'success');
        } else {
          addNotification(result['en'].message, 'success'); // Fallback to English
        }
        reloadFN.value?.();
      }else{
        if (lang === 'it' || lang === 'en') {
          addNotification(result[lang].message, 'error');
        } else {
          addNotification(result['en'].message, 'error'); // Fallback to English
        }
      }
    }
    catch (error) {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Error during import" : "Errore durante l'importazione", 'error');
    }
  })

  const reload = $(async () => {
    if (filter.value.value != '') {
      const query = await search({ filter: `%${filter.value.value}%` });
      //console.log(query);
      return query;
    }
    else
      return await getUserCliente();
  })

  const reload2 = $(async (e: any) => {
    reloadFN.value = e;
  })

  const showPreviewCSV = $(() => {
    showPreview.value = true;
  })

  const t = inlineTranslate();

  return (
    <>
      <div class="size-full overflow-hidden lg:px-40 md:px-24 px-0">
        {/* Aggiungi questo div per le notifiche */}
        <div class="fixed top-8 left-1/2 z-50 flex flex-col items-center space-y-4 -translate-x-1/2">
          {notifications.value.map((notification, index) => (
            <div
              key={index}
              class={[
                "flex items-center gap-3 min-w-[320px] max-w-md rounded-xl px-6 py-4 shadow-2xl border-2 transition-all duration-300 text-base font-semibold",
                notification.type === "success"
                  ? "bg-green-500/90 border-green-700 text-white"
                  : notification.type === "error"
                    ? "bg-red-500/90 border-red-700 text-white"
                    : "bg-white border-blue-400 text-blue-800"
              ]}
              style={{
                filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.18))",
                opacity: 0.98,
              }}
            >
              {/* Icona */}
              {notification.type === "success" && (
                <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {notification.type === "error" && (
                <svg class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {notification.type === "loading" && (
                <svg class="h-7 w-7 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              )}

              {/* Messaggio */}
              <span class="flex-1">{notification.message}</span>
            </div>
          ))}
        </div>

        <Title haveReturn={true} url={"/" + lang + "/admin/panel"}>{t("admin.panel")}</Title>
        <Table>
          {/* Header: titolo + preview CSV + ricerca */}
          <div class="flex flex-col md:flex-row md:items-center md:justify-between dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 gap-2 mb-4 bg-gray-50 px-4 py-3 rounded-t-xl border-b border-gray-200">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-lg text-gray-800 dark:text-gray-100">{t("admin.uc.relationList")}</span>
              <BtnInfoTable showPreviewInfo={showPreviewCSV}></BtnInfoTable>
            </div>
            <div class="flex items-center gap-2">
              <TextBoxForm
                id="txtfilter"
                value={filter.value.value}
                ref={txtQuickSearch}
                placeholder={t("quicksearch")}
                onInput$={(e: InputEvent) => {
                  filter.value.value = (e.target as HTMLInputElement).value;
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  if (reloadFN) reloadFN.value?.();
                }}
                search={true}
              />
            </div>
          </div>
          <div class="flex flex-row items-center gap-2 mb-4 [&>*]:my-0 [&>*]:py-0">
            {/* Bottoni azione in basso a sinistra */}
            <ButtonAdd
              nomePulsante={t("admin.uc.addrelation")}
              onClick$={openClientiDialog}
            />
            <div>
              <Import
                OnError={handleError}
                OnOk={handleOkay}
              />
            </div>
          </div>
          {/* Tabella dati */}
          <Dati
            dati={dati.value}
            nomeTabella={t("relations")}
            OnModify={Modify}
            OnDelete={Delete}
            DBTabella="usercliente"
            onReloadRef={reload2}
            funcReloadData={reload}
          />
        </Table>
      </div>

      {showDialog.value && (
        <div class="dialog-overlayAdmin openAdmin ">
          <div class="dialog-contentAdmin">
            <div class="absolute top-4 right-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-300" onClick$={closeClientiDialog}>
              {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 dark:text-gray-700">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg> */}
            </div>
            <Form action={formAction.value} onSubmit$={reloadTable} class="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-500 animate-fade-in">
              {/* Titolo */}
              <div class="flex items-center gap-3 mb-6">
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100">
                  <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 class="text-2xl font-extrabold text-gray-800 dark:text-gray-200 tracking-tight">
                  {isEditing.value ? t("admin.tech.modtecnico") : t("admin.tech.addtecnico")}
                </h3>
                <span class="ml-2 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold tracking-wide border border-cyan-200">Form</span>
              </div>

              {/* Separatore */}
              <hr class="border-cyan-100 mb-8" />

              {/* Corpo del form */}
              <div class="space-y-6">
                {/* Hidden fields */}
                <input type="hidden" name="idcliente" id="idC" value={currentIdC.value} />
                <input type="hidden" name="iducliente" id="idUC" value={currentIdUC.value} />

                {/* Cliente */}
                <div>
                  <SelectForm
                    value=""
                    OnClick$={(e) => {
                      (document.getElementsByName("idcliente")[0] as HTMLInputElement).value = (e.target as HTMLOptionElement).value;
                    }}
                    id="idUC"
                    name="idcliente"
                    title={t("client.client")}
                    listName=""
                  >
                    {!isEditing.value && <option value="0" selected>{t("noselected")}</option>}
                    {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                    {clientList.value && clientList.value.map((row: any) => (
                      <option value={row.idcliente} key={row.idcliente}>{row.nomecliente}</option>
                    ))}
                  </SelectForm>
                </div>

                {/* Nome */}
                <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="NomeCU"
                    placeholder={t("admin.uc.formuser.name")}
                    nameT="nome"
                    title={t("name") + "*"}
                    value={nome.value}
                  />
                  {formAction.value.value?.failed && formAction.value.value.fieldErrors.nome && (
                    <div class="flex items-center gap-2 mt-1 text-xs text-red-600 font-semibold animate-shake">
                      <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                      </svg>
                      {lang === "en" ? "Name not valid" : "Nome non valido"}
                    </div>
                  )}
                </div>

                {/* Cognome */}
                <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="CognomeCU"
                    placeholder={t("admin.uc.formuser.surname")}
                    nameT="cognome"
                    title={t("surname") + "*"}
                    value={cognome.value}
                  />
                  {formAction.value.value?.failed && formAction.value.value.fieldErrors.cognome && (
                    <div class="flex items-center gap-2 mt-1 text-xs text-red-600 font-semibold animate-shake">
                      <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                      </svg>
                      {lang === "en" ? "Surname not valid" : "Cognome non valido"}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="EmailCU"
                    placeholder={"Email"}
                    nameT="email"
                    title={"Email*"}
                    value={email.value}
                  />
                  {formAction.value.value?.failed && formAction.value.value.fieldErrors.email && (
                    <div class="flex items-center gap-2 mt-1 text-xs text-red-600 font-semibold animate-shake">
                      <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                      </svg>
                      {formAction.value.value.fieldErrors.email}
                    </div>
                  )}
                </div>

                {/* Password (solo in aggiunta) */}
                {!isEditing.value && (
                  <div>
                    <TextBoxForm
                      error={formAction.value.value}
                      id="PwdT"
                      placeholder={t("admin.uc.formuser.password")}
                      nameT="pwd"
                      title={"Password*"}
                      value={password.value}
                    />
                    {formAction.value.value?.failed && formAction.value.value.fieldErrors.pwd && (
                      <div class="flex items-center gap-2 mt-1 text-xs text-red-600 font-semibold animate-shake">
                        <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                        </svg>
                        {lang === "en" ? "Password not valid" : "Password non valido"}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Azioni */}
              <div class="flex justify-end gap-4 mt-10">
                <button
                  type="button"
                  onClick$={closeClientiDialog}
                  class="cursor-pointer px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-200"
                >
                  <svg class="w-5 h-5 inline-block mr-1 -mt-1 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t("cancel")}
                </button>
                <button
                  class="cursor-pointer px-6 py-2 rounded-lg bg-green-500 to-cyan-500 text-white font-semibold hover:bg-green-600 transition shadow-lg focus:outline-none focus:ring-2 focus:ring-green-200"
                  type="submit"
                >
                  <svg class="w-5 h-5 inline-block mr-1 -mt-1 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t("confirm")}
                </button>
              </div>
            </Form>


          </div>
        </div>
      )}
      <PopupModal
        visible={showPreview.value}
        title={
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Formato richiesto per l'importazione CSV</span>
            <span class="ml-2 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wide">CSV</span>
          </div>
        }
        onClosing$={() => { showPreview.value = false; }}
      >
        <TableInfoCSV tableName="usercliente"></TableInfoCSV>
      </PopupModal>
      


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