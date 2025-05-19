import { $, component$, getLocale, useSignal, useStyles$, useTask$  } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Form, routeAction$, server$ , z, zod$ } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import Table from "~/components/table/Table";
import Dati from "~/components/table/Dati_Headers";
import ButtonAdd from "~/components/table/ButtonAdd";
import styles from "../dialog.css?inline";
import TextBoxForm from '~/components/form/formComponents/TextboxForm';
import Import from "~/components/table/ImportCSV";
import sql from "~/../db";
import PopupModal from "~/components/ui/PopupModal";
import BtnInfoTable from "~/components/table/btnInfoTable";
import TableInfoCSV from "~/components/table/tableInfoCSV";
import { inlineTranslate } from "qwik-speak";

type Notification = {
  message: string;
  type: 'success' | 'error';
};

export interface FilterObject {
  value?: string;
}

export const extractRow = (row: any) => {
  const { idcliente, nomecliente } = row;
  return {
    idcliente,
    nomecliente
  }
}

export const deleteRow = server$(async function (this, data) {
  try {

    await sql`DELETE FROM clienti WHERE clienti.idcliente = ${data.idcliente}`;
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
})

export const getTecnici = server$(async () => {
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
export const deleteClient = server$(async () => {
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

export const useModCliente = routeAction$(async (data) => {
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

export const useAddCliente = routeAction$(async (data) => {
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

export const search = server$(async (data) => {
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

  useTask$(async ({ track }) => {
    const query = await getTecnici();
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

  const handleOk = $(async () => {
    addNotification(lang === "en" ? "Import completed successfully" : "Importazione completata con successo", 'success');
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

        <Title haveReturn={true} url={"/" + lang + "/admin/panel"}>{t("admin.panel")}</Title>
        <Table title={t("admin.client.list")}>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 bg-gray-50 px-4 py-3 rounded-t-xl border-b border-gray-200">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-lg text-gray-800">{t("admin.tech.list")}</span>
              <BtnInfoTable showPreviewInfo={showPreviewCSV}></BtnInfoTable>
            </div>
            <div class="flex items-center gap-2">
              <TextBoxForm
                id="txtfilter"
                value={filter.value.value}
                ref={txtQuickSearch}
                placeholder={t("quicksearch")}
                onInput$={(e:InputEvent) => {
                  filter.value.value = (e.target as HTMLInputElement).value;
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  if (reloadFN) reloadFN.value?.();
                }}
                search={true}
              />
            </div>
          </div>
          <Dati dati={dati.value} title={t("admin.client.list")} nomeTabella={t("admin.client.clients")} OnModify={Modify} OnDelete={Delete} DBTabella="clienti" onReloadRef={getRef} funcReloadData={reload}></Dati>
          <ButtonAdd nomePulsante={t("admin.client.addclient")} onClick$={openClientiDialog}></ButtonAdd>
          <Import nomeImport="clienti" OnError={handleError} OnOk={handleOk}></Import>
        </Table>
      </div>

      {showDialog.value && 

        <div class="dialog-overlayAdmin openAdmin">
          <div class="dialog-contentAdmin">
            <div class="absolute top-4 right-4 cursor-pointer hover:bg-gray-200 rounded-md transition-all duration-300" onClick$={closeClientiDialog}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></div>
            <Form action={formAction.value} onSubmit$={reloadTable} class="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 animate-fade-in">
              {/* Titolo */}
              <div class="flex items-center gap-3 mb-6">
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100">
                  <svg class="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 class="text-2xl font-extrabold text-gray-800 tracking-tight">
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
                  {formAction.value.value?.failed && formAction.value.value.fieldErrors.telefono && (
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
                  {t("confirm")}
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