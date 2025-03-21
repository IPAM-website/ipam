import { component$ } from "@builder.io/qwik";
import TableMaps from "./tableMaps";

interface DatiProps { dati: any[], nomeTabella: string }

export default component$<DatiProps>(({ dati, nomeTabella }) => {
    return (
        <div class="w-11/12 mx-auto">
            {/* Intestazioni della tabella */}
            <div class="grid grid-cols-4 gap-4">
                {TableMaps[nomeTabella].headers.map((header, index) => (
                    <div key={index} class="text-zinc-500 text-base font-semibold font-['Inter'] leading-normal py-1 px-4">
                        {header}
                    </div>
                ))}
            </div>

            {/* Righe della tabella */}
            {dati.length > 0 ? (
                dati.map((row, rowIndex) => (
                    <div key={rowIndex} class="grid grid-cols-4 gap-4 border-t border-neutral-200">
                        {TableMaps.tecnici.keys.map((key, colIndex) => (
                            <div key={`${rowIndex}-${colIndex}`} class="text-black text-base font-medium font-['Inter'] leading-normal p-4">
                                {row[key] || "N/A"}
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <div class="text-black text-base font-medium font-['Inter'] leading-normal text-center p-5 border-t border-neutral-200">
                    Non sono presenti tecnici nella tabella
                </div>
            )}
        </div>
    );
});