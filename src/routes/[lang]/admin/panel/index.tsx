import { component$, getLocale, useSignal, useTask$ } from "@builder.io/qwik";
import type {
  DocumentHead,
  RequestHandler} from "@builder.io/qwik-city";
import {
  routeLoader$,
  server$,
  useNavigate,
} from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import Title from "~/components/layout/Title";
import { useLogsLoader } from './logs.loader';
import { sqlForQwik } from "~/../db";
import LogsList from "~/components/utils/LogsList";
import type { UtenteModel } from "~/dbModels";
import { inlineTranslate } from "qwik-speak";

export { useLogsLoader };

export const onRequest: RequestHandler = async ({ cookie, redirect, sharedMap, env }) => {
  if (cookie.has("jwt")) {
    const user: any = jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string)
    sharedMap.set("user", user);
  }
  else
    throw redirect(301, "/login");
};

export const useUser = routeLoader$(({ sharedMap }) => {
  return sharedMap.get("user") as UtenteModel;
});

interface infoProps {
  ntecnici: string;
  nclienti: string;
  nsiti: string;
  rapct: string;
  rapst: string;
}

// interface logsProps {
//   data: string;
//   ora: string;
//   descrizione: string;
// }

export const onGet: RequestHandler = async ({
  cookie,
  redirect,
  sharedMap,
  env,
}) => {
  let user;
  if (cookie.has("jwt")) {
    try {
      user = jwt.verify(
        cookie.get("jwt")!.value,
        env.get("JWT_SECRET") as string,
      ) as any;
      sharedMap.set("user", user);
    } catch {
      throw redirect(302, "/login");
    }
    if (!user.admin) throw redirect(302, "/dashboard");
  }
};

export const getInfo = server$(async function() {
  const sql = sqlForQwik(this.env);
  const info: infoProps = {
    ntecnici: "0",
    nclienti: "0",
    nsiti: "0",
    rapct: "0",
    rapst: "0",
  };
  try {
    const query1 = await sql`SELECT COUNT(*) FROM tecnici`;
    info.ntecnici = query1[0].count;
    const query2 = await sql`SELECT COUNT(*) FROM clienti`;
    info.nclienti = query2[0].count;
    const query3 = await sql`SELECT COUNT(*) FROM siti`;
    info.nsiti = query3[0].count;
    //const query4 = await sql`SELECT AVG(nclienti) FROM ( SELECT COUNT(*) as nclienti FROM cliente_tecnico GROUP BY idcliente )`
    //if(query4[0].avg == null)
    //info.rapct = '0';
    //else
    //info.rapct = (query4[0].avg as string).substring(0, 4);
    //const query5 = await sql`SELECT AVG(nclienti) FROM ( SELECT COUNT(*) as nclienti FROM cliente_tecnico INNER JOIN datacenter ON cliente_tecnico.idcliente=datacenter.idcliente INNER JOIN siti ON datacenter.iddc = siti.iddc GROUP BY idsito )`
    //if(query5[0].avg == null)
    //info.rapst = '0';
    //else
    //info.rapst = (query5[0].avg as string).substring(0, 4);
  } catch (e) {
    console.log("Errore: ", e);
  }
  //console.log(info)
  return info;
});

export default component$(() => {
  // const logs = useLogsLoader();
  const info = useSignal<infoProps>();
  const lang = getLocale("en");
  const nav = useNavigate();

  useTask$(async () => {
    info.value = await getInfo();
  });

  const t = inlineTranslate();
  return (
    <>
      <div class="size-full overflow-hidden  px-0 md:px-24 lg:px-40 animateEnter">
        <Title
          haveReturn={true}
          url={"/" + lang + "/dashboard"}
        >{t("admin.panel")}</Title>
        <div class="mt-8 flex flex-col gap-8 md:flex-row">
          <div class="inline-flex w-full flex-4 flex-col dark:bg-gray-800 dark:border-neutral-700 dark:text-gray-100 dark:**:text-gray-100  dark:**:border-gray-600 items-start justify-start gap-1 rounded-lg border-1 border-[#cdcdcd] px-5 py-3 md:w-72">
            <div class="flex h-[50px] w-full items-center overflow-hidden">
              <div class="text-xl font-semibold text-black">{t("admin.variousinfo")}</div>
            </div>
            <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-[#cacaca] px-2 py-2.5">
              <div class="justify-start text-xl font-normal text-black">{t("admin.numtecnici")}</div>
              <div class="justify-start text-xl font-normal text-black">
                {info.value?.ntecnici}
              </div>
            </div>
            <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-[#cacaca] px-2 py-2.5">
              <div class="justify-start text-xl font-normal text-black">{t("admin.numclienti")}</div>
              <div class="justify-start text-xl font-normal text-black">
                {info.value?.nclienti}
              </div>
            </div>
            <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-[#cacaca] px-2 py-2.5">
              <div class="justify-start text-xl font-normal text-black">{t("admin.numsiti")}</div>
              <div class="justify-start text-xl font-normal text-black">
                {info.value?.nsiti}
              </div>
            </div>
            <div class="inline-flex w-full items-center justify-between overflow-hidden border-t border-[#cacaca] px-2 py-2.5">
              <div class="justify-start text-xl font-normal text-black">{t("admin.avgtec")}</div>
              <div class="justify-start text-xl font-normal text-black">
                {info.value?.rapct}
              </div>
            </div>
          </div>

          <div class="flex-initial rounded-lg dark:bg-gray-800 dark:border-neutral-700 dark:text-gray-100 dark:**:text-gray-100  dark:**:border-gray-600 border-1 border-[#cdcdcd]">
            <div class="flex flex-1 flex-col *:p-2">
              <div class="flex flex-1 border-b border-[#f3f3f3]">
                <div class="w-full text-center font-['Inter'] text-base font-semibold text-black">{t("admin.operations")}</div>
              </div>
              <div class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer">
                <button
                  onClick$={()=>nav("/" + lang + "/admin/panel/tecnici")}
                  class="flex-1 py-1 text-center font-['Inter'] text-base text-black cursor-pointer"
                >{t("admin.viewalltecnici")}</button>
              </div>
              <div class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer">
                <button
                  onClick$={()=>nav("/" + lang + "/admin/panel/clienti")}
                  class="flex-1 py-1 text-center font-['Inter'] text-base text-black cursor-pointer"
                >{t("admin.viewallclienti")}</button>
              </div>
              <div class="flex flex-1 border-b border-gray-100 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-500 cursor-pointer">
                <button
                  onClick$={()=>nav("/" + lang + "/admin/panel/utenti_clienti")}
                  class="flex-1 py-1 text-center font-['Inter'] text-base text-black cursor-pointer"
                >{t("admin.viewallutenti")}</button>
              </div>
            </div>
          </div>
        </div>

        <LogsList />

      </div>
    </>
  );

});

export const head: DocumentHead = {
  title: "Admin Panel",
  meta: [
    {
      name: "Admin Page",
      content: "Admin Page for Technician and Clients management",
    },
  ],
};
