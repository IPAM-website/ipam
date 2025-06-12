import { component$, getLocale, useSignal, useTask$, $, useStyles$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { server$, Form, routeAction$, zod$, z } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import ButtonAdd from "~/components/table/ButtonAdd";
import TextBoxForm from "~/components/form/formComponents/TextboxForm";
import styles from "../dialog.css?inline";
import { sqlForQwik } from "~/../db";
import Dati from "~/components/table/Dati_Headers";
import CHKForms from "~/components/form/formComponents/CHKForms";
import Import from "~/components/table/ImportCSV";
import PopupModal from "~/components/ui/PopupModal";
import BtnInfoTable from "~/components/table/btnInfoTable";
import TableInfoCSV from "~/components/table/tableInfoCSV";
// import { useNotify } from "~/services/notifications";
import bcrypt from "bcryptjs";
import { inlineTranslate } from "qwik-speak";
import { getUser, isUserClient } from "~/fnUtils";

type Notification = {
  message: string;
  type: "success" | "error" | "loading";
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

export const getTecnici = server$(async function () {
  const sql = sqlForQwik(this.env);
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

export const searchAdmins = server$(async function () {
  const sql = sqlForQwik(this.env);
  try {
    const query = await sql`SELECT * FROM tecnici WHERE admin=true`
    return query.length > 0;
  }
  catch {
    return false
  }
})

export const useModTecnico = routeAction$(async function (data, { env }) {
  const sql = sqlForQwik(env);
  try {
    await sql`
      UPDATE tecnici
      SET nometecnico = ${data.nome}, cognometecnico = ${data.cognome}, ruolo = ${data.ruolo}, emailtecnico = ${data.email}, telefonotecnico = ${data.telefono || null}, admin = ${data.admin == "on"}
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
  telefono: z.string().optional()
}))

export const useAddTecnico = routeAction$(async function (data, { env }) {
  const sql = sqlForQwik(env);
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
  const sql = sqlForQwik(this.env);
  try {

    await sql`DELETE FROM tecnici WHERE tecnici.idtecnico = ${data.idtecnico}`;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
})

export const search = server$(async function (data) {
  const sql = sqlForQwik(this.env);
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

export const insertRow = server$(async function (data: string[][]) {
  const lang = getLocale("en");
  const sql = sqlForQwik(this.env);
  try {
    const expectedHeaders = ["nometecnico", "cognometecnico", "ruolo", "emailtecnico", "telefonotecnico", "pwdtecnico"];

    if (data.length === 0) {
      throw new Error(lang == "it" ? "CSV vuoto" : "CSV is empty");
    }

    const headerRow = data[0];
    const receivedHeaders = headerRow.map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());

    if (receivedHeaders.length !== expectedHeaders.length) {
      throw new Error(lang == "it" ? `Numero di colonne errato. Attese ${expectedHeaders.length}, ricevute ${receivedHeaders.length}` : `Number of columns incorrect. Expected ${expectedHeaders.length}, received ${receivedHeaders.length}`);
    }

    if (!receivedHeaders.every((h, index) => h === expectedHeaders[index].toLowerCase())) {
      throw new Error(lang == "it" ? `Intestazioni non valide. Atteso: ${expectedHeaders.join(", ")}` : `Invalid headers. Expected: ${expectedHeaders.join(", ")}`);
    }
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const [nomeTecnicoRow, cognomeTecnicoRow, ruoloRow, emailTecnicoRow, telefonoTecnicoRow, pwdTecnicoRow] = row;
      //console.log(nomeTecnicoRow, cognomeTecnicoRow, ruoloRow, emailTecnicoRow, telefonoTecnicoRow, pwdTecnicoRow)
      const nomeTecnico = nomeTecnicoRow.replace(/^"|"$/g, '').trim();
      const cognomeTecnico = cognomeTecnicoRow.replace(/^"|"$/g, '').trim();
      const ruolo = ruoloRow.replace(/^"|"$/g, '').trim();
      const emailTecnico = emailTecnicoRow.replace(/^"|"$/g, '').trim();
      let telefonoTecnico;
      if (telefonoTecnicoRow) {
        telefonoTecnico = telefonoTecnicoRow.replace(/^"|"$/g, '').trim();
      }
      else {
        telefonoTecnico = "";
      }
      const pwdTecnico = pwdTecnicoRow.replace(/^"|"$/g, '').trim();
      //console.log(ipRete.toString(),prefissoRete.toString(),nomerete.toString(),descrizione.toString())

      //Ricerca se tecnico esiste gia'
      const existingTecnico = await sql`
        SELECT r.idtecnico 
        FROM tecnici r
        WHERE 
          r.nometecnico = ${nomeTecnico} 
          AND r.cognometecnico = ${cognomeTecnico}
          AND r.emailtecnico = ${emailTecnico}
      `;
      if (existingTecnico.length > 0) {
        throw new Error(`Il tecnico ${nomeTecnico} ${cognomeTecnico} con email ${emailTecnico} esiste già`);
      }

      const user = await getUser()
      await sql.begin(async (tx) => {
        await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
        await tx`
          INSERT INTO tecnici 
            (nometecnico, cognometecnico, ruolo, emailtecnico, pwdtecnico, telefonotecnico, admin) 
          VALUES 
            (${nomeTecnico}, ${cognomeTecnico}, ${ruolo}, ${emailTecnico}, ${bcrypt.hashSync(pwdTecnico, 12)}, ${telefonoTecnico}, false)
        `;
      })
    }
    return {
      success: true,
      message: lang == "it" ? "Tecnico inserito con successo" : "Technician inserted successfully"
    }
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: lang == "it" ? "Errore durante l'inserimento nel DB:" + err : "Error during insertion in the DB: " + err
    }
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
  const addAction = useAddTecnico();
  const editAction = useModTecnico();
  const formAction = useSignal(addAction);
  const reloadFN = useSignal<(() => void) | null>(null);
  const notifications = useSignal<Notification[]>([]);
  const filter = useSignal<FilterObject>({ value: '' });
  const txtQuickSearch = useSignal<HTMLInputElement | undefined>(undefined);
  const showPreview = useSignal(false);
  const isClient = useSignal<boolean>(false);
  const lastAdmin = useSignal<boolean>(false);

  useTask$(async ({ track }) => {
    isClient.value = await isUserClient()
    const query = await getTecnici();
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

  const addNotification = $((message: string, type: "success" | "error" | "loading") => {
    notifications.value = [...notifications.value, { message, type }];
    if (type !== "loading") {
      setTimeout(() => {
        notifications.value = notifications.value.filter((n) => n.message !== message);
      }, 4000);
    }
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
    addNotification("Eliminazione in corso...", "loading");
    if (await deleteRow(extractRow(row))) {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Record deleted successfully" : "Dato eliminato con successo", 'success');
    }
    else {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Error during deleting" : "Errore durante la eliminazione", 'error');
    }
  })


  const handleError = $((error: any) => {
    console.log(error);
    addNotification(lang === "en" ? "Error during import" : "Errore durante l'importazione", 'error');
  })

  const handleOk = $(async (data: any) => {
    addNotification("Operazione in corso...", "loading");
    try {
      const result = await insertRow(data);
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      if (result.success) {
        reloadFN.value?.();
        addNotification(result.message, 'success');
      } else {
        addNotification(result.message, 'error');
      }
    } catch (error) {
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang === "en" ? "Error during import:" + error : "Errore durante l'importazione:" + error, 'error');
    }
  })

  const getREF = $((reloadFunc: () => void) => { reloadFN.value = reloadFunc; })

  const reload = $(async () => {
    if (filter.value.value !== "") {
      const query = await search({ filter: `%${filter.value.value}%` });
      return query;
    }
    else
      return await getTecnici();
  })

  const dff = $((r: any) => !r.admin);

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

        <div class="animateEnter">
          <Title haveReturn={true} url={"/" + lang + "/admin/panel"}>{t("admin.panel")}</Title>
          <Table>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 px-4 py-3 rounded-t-xl border-b border-gray-200">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-lg text-gray-800 dark:text-gray-100 ">{t("admin.tech.list")}</span>
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
              <ButtonAdd nomePulsante={t("admin.tech.addtech")} onClick$={openTeniciDialog}></ButtonAdd>
              <div>
                <Import OnError={handleError} OnOk={handleOk}></Import>
              </div>
            </div>
            <Dati isClient={isClient.value} dati={dati.value} title={t("admin.tech.list")} nomeTabella={t("admin.tech.technicians")} OnModify={Modify} OnDelete={Delete} onReloadRef={getREF} DBTabella="tecnici" deleteWhen={dff} funcReloadData={reload}></Dati>
          </Table>
        </div>
      </div>

      {showDialog.value && (
        <div class="dialog-overlayAdmin openAdmin">
          <div class="dialog-contentAdmin">
            {/* Close button */}
            <div class="absolute top-4 right-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-300" onClick$={closeTecniciDialog}>
              {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
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
                  {isEditing.value ? t("admin.tech.modtech") : t("admin.tech.addtech")}
                </h3>
                <span class="ml-2 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold tracking-wide border border-cyan-200">Form</span>
              </div>

              {/* Separatore */}
              <hr class="border-cyan-100 mb-8" />

              {/* Corpo del form */}
              <div class="space-y-6">
                {/* Hidden field */}
                <input class="opacity-0 hidden" id="idT" type="text" name="idtecnico" value={currentId.value} />

                {/* Admin checkbox */}
                {!lastAdmin.value && (
                  <CHKForms id="chkT" name="admin" value={admin.value} nameCHK="Admin" />
                )}

                {/* Nome */}
                <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="NomeT"
                    placeholder={t("admin.tech.form.name")}
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
                    id="CognomeT"
                    placeholder={t("admin.tech.form.surname")}
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

                {/* Ruolo */}
                <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="RuoloT"
                    placeholder={t("admin.tech.form.role")}
                    nameT="ruolo"
                    title={t("role") + "*"}
                    value={ruolo.value}
                  />
                  {formAction.value.value?.failed && formAction.value.value.fieldErrors.ruolo && (
                    <div class="flex items-center gap-2 mt-1 text-xs text-red-600 font-semibold animate-shake">
                      <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                      </svg>
                      {lang === "en" ? "Role not valimax-w-2xl mx-auto animate-fade-ind" : "Ruolo non valido"}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="EmailT"
                    placeholder={t("admin.tech.form.mail")}
                    nameT="email"
                    title={"Email *"}
                    value={mail.value}
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

                {/* Telefono */}
                <div>
                  <TextBoxForm
                    id="TelefonoT"
                    placeholder={t("admin.tech.form.phone")}
                    nameT="telefono"
                    title={t("phone")}
                    value={telefono.value}
                  />
                </div>

                {/* Password */}
                {!isEditing.value && <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="PwdT"
                    placeholder={t("admin.tech.form.password")}
                    nameT="pwd"
                    title={"Password *"}
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
                </div>}
              </div>

              {/* Azioni */}
              <div class="flex justify-end gap-4 mt-10">
                <button
                  type="button"
                  onClick$={closeTecniciDialog}
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


      {showPreview.value && (
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
          <TableInfoCSV tableName="tecnici"></TableInfoCSV>
        </PopupModal>
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