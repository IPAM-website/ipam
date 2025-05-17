import { component$, useSignal, $ } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import sql from "~/../db";
import { DBTableMaps } from "~/tableMaps";

interface ButtonProps { nomeImport : string, OnError : ( error : any ) => void, OnOk : () => void }

export const processCSV = server$(async (csvContent: string) => {
    const parseCSV = (text: string): string[][] => {
      const rows = text
        .split('\n')
        .map(row => row.trim())
        .filter(row => row.length > 0);
  
      return rows.map(row => {  
        const values = row.split(/;\s*/).map(value => {
          return value.trim().replace(/^"|"$/g, '');
        });
        return values;
      });
    };
  
    try {
      return parseCSV(csvContent);
    } catch (error) {
      throw new Error('Errore nel processing del CSV');
    }
  });
  
  export const dbInsert = server$(async ({ data, tabella }) => {
    try{
      const [_, ...rows] = data;
      const tableMap = DBTableMaps[tabella].keys;
      //console.log(tabella)
      // console.log(DBTableMaps[tabella]);
      // console.log(rows)
      // console.log(data);
      const query = await sql`INSERT INTO ${sql(tabella)} (${sql(tableMap)}) VALUES ${sql(rows)}`;
      //console.log(query)
    }
    catch(err){
      console.log(err);
      throw new Error('Errore durante l\'inserimento nel DB');
    }
  });

export default component$<ButtonProps>(({ nomeImport, OnError, OnOk }) => {
    const showTooltip = useSignal(false);
    const csvData = useSignal<string[][]>([]);
    const headers = useSignal<string[]>([]);
    const error = useSignal<string>('');
    const fileName = useSignal<string>('');
    const isLoading = useSignal(false);
    const fileInput = useSignal<HTMLInputElement>();

    const readFileClient = $((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsText(file, 'UTF-8');
        });
    });

    const handleFileUpload = $(async (event: Event) => {
        error.value = '';
        const input = event.target as HTMLInputElement;
        
        try {
          isLoading.value = true;
    
          if (!input.files?.[0]) {
            await new Promise(resolve => setTimeout(resolve, 100));
            let checks = 0;
            
            while (checks < 20 && !input.files?.[0]) {
              await new Promise(resolve => setTimeout(resolve, 50));
              checks++;
            }
    
            if (!input.files?.[0]) throw new Error('Nessun file selezionato');
          }
    
          const file = input.files[0];
          fileName.value = file.name.toLowerCase();
          //console.log(fileName.value);
    
          if (!fileName.value.endsWith('.csv')) {
            throw new Error('Per favore seleziona un file CSV');
          }
    
          const content = await readFileClient(file);
          const parsedData = await processCSV(content);
          
          csvData.value = parsedData;
          headers.value = parsedData[0] || [];
          await dbInsert({ data: parsedData, tabella: nomeImport });

          isLoading.value = false;

          OnOk()
    
        } catch (err) {
          const errorMsg = (err as Error).message;
          if (errorMsg !== 'Nessun file selezionato') {
            error.value = errorMsg || 'Errore nel processing del file';

            if (OnError) {
                OnError(error.value);
            }
          }
        } finally {
          isLoading.value = false;
          if (fileInput.value) {
            fileInput.value.value = '';
          }
        }
      });

    return (
        <>
            <div class="inline-flex border-1 border-gray-300 h-[40px] rounded-md p-2 hover:translate-y-1 transition-all duration-200 cursor-pointer relative mt-4 has-tooltip"
            onMouseEnter$={() => showTooltip.value = true}
            onMouseLeave$={() => showTooltip.value = false}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
                </svg>
                <input
                    type="file"
                    accept=".csv"
                    onChange$={handleFileUpload}
                    ref={fileInput}
                    class="opacity-0 absolute inset-0 cursor-pointer"
                    disabled={isLoading.value}
                />

                <span class="tooltip" >
                 {$localize`Importazione CSV`}
                </span>

            </div>
        </>
    );
});