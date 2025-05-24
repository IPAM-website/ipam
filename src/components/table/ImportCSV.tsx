/* eslint-disable qwik/valid-lexical-scope */
import { component$, useSignal, $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { inlineTranslate } from "qwik-speak";

interface ButtonProps {
  OnError: (error: string) => void;
  OnOk: (dataParsed: string[][]) => void;
}

export const processCSV = server$(async (csvContent: string) => {
  const parseCSV = (text: string): string[][] => {
    const rows = text
      .split("\n")
      .map((row) => row.trim())
      .filter((row) => row.length > 0);

    // Detect separator by checking which occurs more frequently in the first row
    const firstRow = rows[0];
    const semicolonCount = firstRow.split(';').length - 1;
    const commaCount = firstRow.split(',').length - 1;
    const separator = semicolonCount > commaCount ? /;\s*/ : /,\s*/;

    return rows.map((row) => {
      const values = row.split(separator).map((value) => {
        return value.trim().replace(/^"|"$/g, "");
      });
      return values;
    });
  };

  try {
    return parseCSV(csvContent);
  } catch (error) {
    throw new Error("Errore nel processing del CSV");
  }
});

export default component$<ButtonProps>(({ OnError, OnOk }) => {
  const showTooltip = useSignal(false);
  const csvData = useSignal<string[][]>([]);
  const headers = useSignal<string[]>([]);
  const error = useSignal<string>("");
  const fileName = useSignal<string>("");
  const isLoading = useSignal(false);
  const fileInput = useSignal<HTMLInputElement>();

  const t = inlineTranslate();

  const readFileClient = $((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file, "UTF-8");
    });
  });

  const handleFileUpload = $(async (event: Event) => {
    error.value = "";
    const input = event.target as HTMLInputElement;

    try {
      isLoading.value = true;

      if (!input.files?.[0]) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        let checks = 0;

        while (checks < 20 && !input.files?.[0]) {
          await new Promise((resolve) => setTimeout(resolve, 50));
          checks++;
        }

        if (!input.files?.[0]) throw new Error("Nessun file selezionato");
      }

      const file = input.files[0];
      fileName.value = file.name.toLowerCase();

      if (!fileName.value.endsWith(".csv")) {
        throw new Error("Per favore seleziona un file CSV");
      }

      const content = await readFileClient(file);
      const parsedData = await processCSV(content);

      csvData.value = parsedData;
      headers.value = parsedData[0] || [];

      isLoading.value = false;
      OnOk(csvData.value);
    } catch (err) {
      const errorMsg = (err as Error).message;
      if (errorMsg !== "Nessun file selezionato") {
        error.value = errorMsg || "Errore nel processing del file";
        OnError(error.value);
      }
    } finally {
      isLoading.value = false;
      if (fileInput.value) {
        fileInput.value.value = "";
      }
    }
  });

  return (
    <>

      <div
        class="has-tooltip relative inline-flex h-[40px] cursor-pointer rounded-md border-1 border-gray-300 p-2 transition-all duration-200 hover:translate-y-1"
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3"
            />
          </svg>
        )}
        <input
          type="file"
          accept=".csv"
          onChange$={handleFileUpload}
          ref={fileInput}
          class="absolute inset-0 cursor-pointer opacity-0"
          disabled={isLoading.value}
        />
        <span class="tooltip">{t("importcsv")}</span>
      </div>
    </>
  );
});
