import type {
  Signal
} from "@builder.io/qwik";
import {
  component$,
  useSignal,
  useTask$,
} from "@builder.io/qwik";
import { server$, useNavigate } from "@builder.io/qwik-city";
import sql from "~/../db";
import { getBaseURL } from "~/fnUtils";
import type { ClienteModel } from "~/dbModels";
import { inlineTranslate } from "qwik-speak";

export interface ClientListProps {
  client?: Signal<number>,
  currentTec?: number,
  refresh?: number
}

export const getClients = server$(async () => {
  try {
    const query = await sql`SELECT * FROM clienti`;
    return query;
  } catch (e: any) {
    throw new Error(e);
  }
});

function stringToColor(str: string) {
  // FNV-1a hash
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  hash = Math.abs(hash + str.length * 1234567);
  const h = hash % 360;
  const s = 70 + (hash % 20); // 70-89%
  const l = 50 + (hash % 20); // 50-69%
  return `hsl(${h}, ${s}%, ${l}%)`;
}


function getContrastColor(bg: string) {
  // Estrae la luminosità dalla stringa hsl
  const match = bg.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
  if (match && parseInt(match[1]) < 60) return "#fff";
  return "#233";
}


export default component$((props: ClientListProps) => {
  const clientList = useSignal<ClienteModel[] | null>(null);
  const nav = useNavigate();

  const t = inlineTranslate();

  useTask$(async ({ track }) => {
    track(() => props.refresh);
    clientList.value = null;
    clientList.value = await getClients() as any;
  });

  return (
    <div class="mt-8 grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {clientList.value && clientList.value.length > 0 ? (
        clientList.value.map((x: ClienteModel) => {
          const color = stringToColor(x.nomecliente);
          const textColor = getContrastColor(color);

          return (
            <div
              key={x.idcliente}
              tabIndex={0}
              class="
            group cursor-pointer select-none
            rounded-2xl shadow-xl
            transition-all duration-200
            outline-none
            hover:shadow-2xl hover:-translate-y-1 hover:scale-105
            border-2 border-transparent hover:border-blue-300
            focus:ring-2 focus:ring-blue-200
            bg-white/80
            relative
            dark:bg-gray-600
            
            overflow-hidden
          "
              onClick$={() => {
                nav(getBaseURL() + x.idcliente);
              }}
            >
              {/* Header unico, colore random */}
              <div
                class="
              flex items-center gap-4
              rounded-2xl
              px-7 py-7
              transition-colors duration-200
              relative
              
              z-10
            "
              >
                {/* Badge con iniziali */}
                <div
                  class="
                flex h-14 w-14 items-center justify-center
                rounded-full shadow-lg
                text-2xl font-extrabold
                border-4 border-white/40
                ring-2 ring-white/40
                transition-all duration-200
                group-hover:scale-110
                group-hover:ring-blue-100
                bg-opacity-95
              "
                  style={{
                    background: color,
                    color: textColor,
                  }}
                >
                  {x.nomecliente
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                {/* Nome cliente */}
                <span
                  class="
                text-2xl font-bold tracking-tight
                transition-colors duration-200
                group-hover:text-blue-900
                dark:group-hover:text-blue-400
                text-shadow
                dark:text-gray-100
                text-gray-600
                "
                  style={{
                    textShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {x.nomecliente}
                </span>
              </div>

              {/* Pennellata colorata piccola in basso a destra */}
              <div
                class="pointer-events-none absolute right-4 bottom-4"
                style={{
                  width: "60px",
                  height: "20px",
                  background: color,
                  borderBottomRightRadius: "16px",
                  borderTopLeftRadius: "16px",
                  transform: "skewX(-20deg)"
                }}
              />
            </div>
          );
        })
      ) : (
        <div class="max-w-[400px] min-w-[300px] rounded-2xl bg-white border border-gray-200 p-10 text-center shadow-md flex flex-col items-center justify-center">
          <span class="text-2xl font-bold text-gray-400 mb-2">{t("noclients")}</span>
        </div>
      )}
    </div>
  );
});
