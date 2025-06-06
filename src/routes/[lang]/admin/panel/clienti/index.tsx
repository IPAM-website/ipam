/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { $, component$, getLocale, useSignal, useStyles$, useTask$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$, server$, z, zod$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import styles from "../dialog.css?inline";
import TextBoxForm from '~/components/form/formComponents/TextboxForm';
import Import from "~/components/table/ImportCSV";
import { sqlForQwik } from "~/../db";
import PopupModal from "~/components/ui/PopupModal";
import BtnInfoTable from "~/components/table/btnInfoTable";
import TableInfoCSV from "~/components/table/tableInfoCSV";
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
  if (!row) return {};
  const { idcliente, nomecliente } = row;
  return {
    idcliente,
    nomecliente
  }
}

export const deleteRow = server$(async function (this, data) {
  const sql = sqlForQwik(this.env);
  try {
    const user = await getUser()
    await sql.begin(async (tx) => {
      await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
      await tx`DELETE FROM clienti WHERE clienti.idcliente = ${data.idcliente}`;
    })
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
})

export const getTecnici = server$(async function() {
  const sql = sqlForQwik(this.env);
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

// NTC delete di cosa ?????
export const deleteClient = server$(async function() {
  const sql = sqlForQwik(this.env);
  try {
    const query = await sql`SELECT * FROM clienti`;
    // Assicurati di sempre ritornare un array
    return Array.isArray(query) ? query : [];
  }
  catch (error) {
    console.error("Database error:", error);
    return []; // Ritorna array vuoto invece di oggetto
  }
})

export const useModCliente = routeAction$(async (data, { env }) => {
  const sql = sqlForQwik(env)
  try {
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
}, zod$({
  idcliente: z.string(),
  nome: z.string().min(2),
}))

export const useAddCliente = routeAction$(async (data, { env }) => {
  const sql = sqlForQwik(env)
  try {
    await sql`
      INSERT INTO clienti (nomecliente,telefonocliente)
      VALUES (${data.nome},${data.telefono})
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
}, zod$({
  nome: z.string().min(2),
  telefono: z.string().min(10)
}))

export const search = server$(async function (data) {
  const sql = sqlForQwik(this.env);
  try {
    const query = await sql`
      SELECT 
        *
      FROM clienti
      WHERE nomecliente LIKE ${data.filter}
      OR telefonocliente LIKE ${data.filter}
    `;
    return query;
  } catch (e) {
    console.log(e);
    return [];
  }
})

export const ImportCSV = server$(async function(data: string[][]) {
  const sql = sqlForQwik(this.env);
  const lang = getLocale("en");
  //console.log(data)
  try {
    const expectedHeaders = ["nomecliente", "telefonocliente"];

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
      const [nomeClienteRow, telefonoClienteRow] = row;
      //console.log(nomeClienteRow)
      const nomeCliente = nomeClienteRow.replace(/^"|"$/g, '').trim();
      let telefonoCliente;
      if (telefonoClienteRow) {
        telefonoCliente = telefonoClienteRow.replace(/^"|"$/g, '').trim();
      }
      else {
        telefonoCliente = "";
      }
      //console.log(nomeCliente)
      const existingCliente = await sql`
        SELECT r.idcliente 
        FROM clienti r
        WHERE 
          r.nomecliente = ${nomeCliente}
      `;
      if (existingCliente.length > 0) {
        throw new Error(lang == "it" ? `Il cliente ${nomeCliente} esiste già` : `The client ${nomeCliente} already exists`);
      }

      const user = await getUser()
      await sql.begin(async (tx) => {
        await tx.unsafe(`SET LOCAL app.audit_user TO '${user.mail.replace(/'/g, "''")}'`);
        await tx`
          INSERT INTO clienti 
            (nomecliente,telefonocliente) 
          VALUES 
            (${nomeCliente},${telefonoCliente})
        `;
      })
    }
    return {
      success: true,
      message: lang == "it" ? "Importazione completata con successo" : "Import completed successfully"
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      message: lang == "it" ? "Errore durante l'importazione: " + e : "Error during import: " + e
    }
  }
})


export default component$(() => {
  useStyles$(styles);
  const dati = useSignal();
  const lang = getLocale("en");
  const nome = useSignal('');
  const telefono = useSignal('');
  const showDialog = useSignal(false);
  const isEditing = useSignal(false);
  const currentId = useSignal<number | null>(null);
  const addAction = useAddCliente();
  const editAction = useModCliente();
  const formAction = useSignal(addAction);
  const notifications = useSignal<Notification[]>([]);
  const filter = useSignal<FilterObject>({ value: '' });
  const txtQuickSearch = useSignal<HTMLInputElement | undefined>(undefined);
  const reloadFN = useSignal<() => void>();
  const showPreview = useSignal(false);
  const isClient = useSignal(true);

  useTask$(async ({ track }) => {
    isClient.value = await isUserClient()
    const query = await getTecnici();
    dati.value = query;
    track(() => isEditing.value);
    // @ts-ignore
    formAction.value = isEditing.value ? editAction : addAction;
  })

  const addNotification = $((message: string, type: "success" | "error" | "loading") => {
    notifications.value = [...notifications.value, { message, type }];
    if (type !== "loading") {
      setTimeout(() => {
        notifications.value = notifications.value.filter((n) => n.message !== message);
      }, 4000);
    }
  });

  const Modify = $((row: any) => {
    const extractRowData = extractRow(row);
    currentId.value = extractRowData.idcliente;
    nome.value = extractRowData.nomecliente;
    isEditing.value = true;
    showDialog.value = true;
  })

  const reloadTable = $(async () => {
    if (formAction.value.value?.success) {
      addNotification(lang === "en" ? "Record edited successfully" : "Dato modificato con successo", 'success');
      reloadFN.value?.();
      showDialog.value = false;
    }
    else
      addNotification(lang === "en" ? "Error during editing" : "Errore durante la modifica", 'error');
  })

  const openClientiDialog = $(() => {
    nome.value = '';
    telefono.value = '';
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

  const handleOk = $(async (data: any) => {
    addNotification(lang == 'it' ? "Operazione in corso..." : "Operation in progress...", 'loading');
    try {
      const result = await ImportCSV(data)
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      if (result.success) {
        addNotification(result.message, 'success');
        reloadFN.value?.();
      } else {
        addNotification(result.message, 'error');
      }
    } catch (e) {
      console.log(e)
      notifications.value = notifications.value.filter(n => n.type !== "loading");
      addNotification(lang == 'it' ? "Errore durante l'importazione: " + e : "Error during import: " + e, 'error');
    }
  })

  const Delete = $(async (row: any) => {
    // console.log(row);
    if (await deleteRow(extractRow(row)))
      addNotification(lang === "en" ? "Record deleted successfully" : "Dato eliminato con successo", 'success');
    else
      addNotification(lang === "en" ? "Error during deleting" : "Errore durante la eliminazione", 'error');
  })
  const getRef = $((e: () => void) => reloadFN.value = e)

  const reload = $(async () => {
    if (filter.value.value !== "") {
      const query = await search({ filter: `%${filter.value.value}%` });
      return query;
    }
    else
      return await getTecnici();
  })

  const showPreviewCSV = $(() => {
    showPreview.value = true
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
        <div class="animateEnter">
          <Table title={t("admin.client.list")}>
            <div class="flex flex-col md:flex-row md:items-center md:justify-between dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 gap-2 mb-4 bg-gray-50 px-4 py-3 rounded-t-xl border-b border-gray-200">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-lg text-gray-800 dark:text-gray-100">{t("admin.client.list")}</span>
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
              <ButtonAdd nomePulsante={t("admin.client.addclient")} onClick$={openClientiDialog}></ButtonAdd>
              <div>
                <Import OnError={handleError} OnOk={handleOk}></Import>
              </div>
            </div>
            <Dati isClient={isClient.value} dati={dati.value} title={t("admin.client.list")} nomeTabella={t("admin.client.clients")} OnModify={Modify} OnDelete={Delete} DBTabella="clienti" onReloadRef={getRef} funcReloadData={reload}></Dati>
          </Table>
        </div>
      </div>

      {showDialog.value &&

        <div class="dialog-overlayAdmin openAdmin">
          <div class="dialog-contentAdmin">
            <div class="absolute top-4 right-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-all duration-300" onClick$={closeClientiDialog}>
              {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg> */}
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
                  {isEditing.value ? t("admin.client.modclient") : t("admin.client.addclient")}
                </h3>
                <span class="ml-2 px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-semibold tracking-wide border border-cyan-200">Form</span>
              </div>

              {/* Separatore */}
              <hr class="border-cyan-100 mb-8" />

              {/* Corpo del form */}
              <div class="space-y-6">
                {/* Hidden field */}
                <input type="hidden" id="idC" name="idcliente" value={currentId.value} />

                {/* Nome */}
                <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="NomeC"
                    placeholder={t("admin.client.form.name")}
                    nameT="nome"
                    title={t("name") + "*"}
                    value={nome.value}
                  />
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.nome && (
                    <div class="flex items-center gap-2 mt-1 text-xs text-red-600 font-semibold animate-shake">
                      <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                      </svg>
                      {lang === "en" ? "Name not valid" : "Nome non valido"}
                    </div>
                  )}
                </div>

                {/* Telefono */}
                <div>
                  <TextBoxForm
                    error={formAction.value.value}
                    id="TelefonoC"
                    placeholder={t("admin.client.form.phone")}
                    nameT="telefono"
                    title={t("phone") + "*"}
                    value={telefono.value}
                  />
                  {formAction.value.value?.failed && formAction.value.value?.fieldErrors.telefono && (
                    <div class="flex items-center gap-2 mt-1 text-xs text-red-600 font-semibold animate-shake">
                      <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01" />
                      </svg>
                      {lang === "en" ? "Phone number not valid" : "Numero di telefono non valido"}
                    </div>
                  )}
                </div>
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
      }

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
          <TableInfoCSV tableName="clienti"></TableInfoCSV>
        </PopupModal>
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