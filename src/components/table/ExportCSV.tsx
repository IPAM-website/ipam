/* eslint-disable qwik/valid-lexical-scope */
import { component$, useSignal, $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { inlineTranslate } from "qwik-speak";
import { sqlForQwik } from "~/../db"
import { IndirizziModel } from "~/dbModels";
import TableMaps from "~/tableMaps";

interface ButtonProps {
  TABLENAME: "indirizzi" | "siti" | "clienti" | "reti"
  OnError: (error: string) => void;
  OnOk: (e?: any) => void;
}

export const createCSV = server$(async function (table: string) {
  const sql = sqlForQwik(this.env)
  try {
    let filters = "";
    let text = "";
    switch (table) {
      case "indirizzi":
        if (!this.params.network)
          filters = `WHERE idrete = ${parseInt(this.params.network)}`
        break;
      case "reti":
        if (!this.params.site)
          filters = `WHERE idsito = ${parseInt(this.params.site)}`
        break;
      case "siti":
        if (!this.params.client)
          filters = `WHERE idcliente = ${parseInt(this.params.client)}`
    }
    const result = (await sql.unsafe(`SELECT * FROM ${table} ${filters}`)) as any[];

    text = TableMaps[table].keys.join(";") + "\n"

    for (const item of result) {
      let line = "";
      for (const voice of TableMaps[table].keys) {
        if (line != "")
          line += ";"
        line += item[voice];
      }
      line += '\n';
      text += line;
    }

    console.log("text");
    console.log(text);

    return text;
  } catch (error) {
    throw new Error("Errore creazione CSV");
  }
});

export default component$<ButtonProps>(({ OnError, OnOk, TABLENAME }) => {
  const showTooltip = useSignal(false);
  const csvData = useSignal<string[][]>([]);
  const error = useSignal<string>("");
  const isLoading = useSignal(false);

  const t = inlineTranslate();
  const fileURL = useSignal<string | null>(null);
  const writeFileClient = $((name: string, text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (fileURL.value != null) {
        window.URL.revokeObjectURL(fileURL.value);
      }
      const data = new Blob([text], { type: 'text/plain' });
      fileURL.value = window.URL.createObjectURL(data);
      const link = document.createElement("a");
      link.download = name;
      link.href = fileURL.value;
      link.click();
    });
  });

  const handleExport = $(async (event: Event) => {
    error.value = "";
    const input = event.target as HTMLInputElement;

    try {
      isLoading.value = true;

      const text = await createCSV(TABLENAME);
      const content = await writeFileClient("export.csv", text);

      isLoading.value = false;

      OnOk(csvData.value);
    } catch (err) {
      const errorMsg = (err as Error).message;
      if (errorMsg !== "Errore") {
        error.value = errorMsg || "Errore nella creazione del file";
        OnError(error.value);
      }
    } finally {
      isLoading.value = false;

    }
  });

  return (
    <>

      <div
        class="has-tooltip relative inline-flex h-[40px] mx-2 cursor-pointer rounded-md border-1 border-gray-300 p-2 transition-all duration-200 hover:translate-y-1"
        onMouseEnter$={() => (showTooltip.value = true)}
        onMouseLeave$={() => (showTooltip.value = false)}
      >
        {isLoading.value ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6 animate-spin"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.023 9.348h4.992v-4.992M2.985 19.644v-4.992H6.978M2.978 3.626v16.622c0 .548.496 1.042 1.12 1.042h16.622c.624 0 1.12-.494 1.12-1.042V3.626c0-.548-.496-1.042-1.12-1.042H4.117c-.624 0-1.12.494-1.12 1.042z"
            />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>

        )}
        <button
          onClick$={handleExport}
          class="absolute inset-0 cursor-pointer opacity-0"
          disabled={isLoading.value}
        ></button>
        <span class="tooltip">{t("exportcsv")}</span>
      </div>
    </>
  );
});
