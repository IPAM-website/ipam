import { component$, getLocale, useSignal, useTask$ } from "@builder.io/qwik";
import { DocumentHead, RequestHandler, routeLoader$, server$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken"
import Title from "~/components/layout/Title";
import sql from "~/../db";
import LogsList from "~/components/utils/LogsList";
import User from "~/routes/user";

export const onRequest: RequestHandler = async ({ cookie, redirect, sharedMap, env }) => {
    if (cookie.has("jwt")) {
        let user: any = jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string)
        sharedMap.set("user", user);
    }
    else
        throw redirect(301, "/login");
};

export const useUser = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('user') as User;
});

interface infoProps {
    ntecnici: string,
    nclienti: string,
    nsiti: string,
    rapct: string,
    rapst: string
}

interface logsProps {
    data: string,
    ora: string,
    descrizione: string
}

export const onGet: RequestHandler = async ({ cookie, redirect, sharedMap, env }) => {
    let user;
    if (cookie.has("jwt")) {
        try {
            user = jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string) as any
            sharedMap.set("user", user);
        } catch {
            throw redirect(302, "/login");
        }
        if (!user.admin)
            throw redirect(302, "/dashboard");
    }
}

export const useInfo = server$(async () => {
    let info: infoProps = {
        ntecnici: '0',
        nclienti: '0',
        nsiti: '0',
        rapct: '0',
        rapst: '0'
    };
    try {
        const query1 = await sql`SELECT COUNT(*) FROM tecnici`
        info.ntecnici = query1[0].count;
        const query2 = await sql`SELECT COUNT(*) FROM clienti`
        info.nclienti = query2[0].count;
        const query3 = await sql`SELECT COUNT(*) FROM siti`
        info.nsiti = query3[0].count;
        const query4 = await sql`SELECT AVG(nclienti) FROM ( SELECT COUNT(*) as nclienti FROM cliente_tecnico GROUP BY idcliente )`
        if(query4[0].avg == null)
            info.rapct = '0';
        else
            info.rapct = (query4[0].avg as string).substring(0, 4);
        const query5 = await sql`SELECT AVG(nclienti) FROM ( SELECT COUNT(*) as nclienti FROM cliente_tecnico INNER JOIN datacenter ON cliente_tecnico.idcliente=datacenter.idcliente INNER JOIN siti ON datacenter.iddc = siti.iddc GROUP BY idsito )`
        if(query5[0].avg == null)
            info.rapst = '0';
        else
            info.rapst = (query5[0].avg as string).substring(0, 4);
    }
    catch (e) {
        console.log("Errore: ", e);
    }
    //console.log(info)
    return info;
})

export default component$(() => {
    const info = useSignal<infoProps>();
    const lang = getLocale("en");

    useTask$(async () => {
        info.value = await useInfo();
    })
    return (
        <>
            <div class="size-full bg-white overflow-hidden">
                <Title haveReturn={true} url={"/" + lang + "/dashboard"}>{$localize`Admin Panel`}</Title>
                <div class="flex  flex-col md:flex-row gap-8 mt-8">

                    <div class="w-full md:w-72 flex-4 px-5 py-3  rounded-lg border-1 border-[#cdcdcd] inline-flex flex-col justify-start items-start gap-1">
                        <div class="h-[50px] w-full flex items-center overflow-hidden">
                            <div class="text-black text-xl font-semibold">{$localize`Informazioni Varie`}</div>
                        </div>
                        <div class="px-2 py-2.5 border-t w-full border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-xl font-normal">{$localize`Numero tecnici`}</div>
                            <div class="justify-start text-black text-xl font-normal">{info.value?.ntecnici}</div>
                        </div>
                        <div class="px-2 py-2.5 border-t w-full border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-xl font-normal">{$localize`Numero clienti`}</div>
                            <div class="justify-start text-black text-xl font-normal">{info.value?.nclienti}</div>
                        </div>
                        <div class="px-2 py-2.5 border-t w-full border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-xl font-normal">{$localize`Numero siti`}</div>
                            <div class="justify-start text-black text-xl font-normal">{info.value?.nsiti}</div>
                        </div>
                        <div class="px-2 py-2.5 border-t w-full border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-xl font-normal">{$localize`Numero medio di clienti per tecnico`}</div>
                            <div class="justify-start text-black text-xl font-normal">{info.value?.rapct}</div>
                        </div>
                        <div class="px-2 py-2.5 border-t w-full border-[#cacaca] inline-flex justify-between items-center overflow-hidden">
                            <div class="justify-start text-black text-xl font-normal">{$localize`Numero medio di siti per tecnico`}</div>
                            <div class="justify-start text-black text-xl font-normal">{info.value?.rapst}</div>
                        </div>
                    </div>

                    <div class="flex-initial rounded-lg border-1 border-[#cdcdcd]">
                        <div class="flex-1 flex flex-col *:p-2 cursor-pointer">
                            <div class="flex flex-1 border-b border-[#f3f3f3]">
                                <div class="text-center w-full text-black text-base font-semibold font-['Inter']">{$localize`Operazioni`}</div>
                            </div>
                            <div class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                <a href={"/"+lang+"/admin/panel/tecnici"} class="flex-1 text-center text-black text-base font-['Inter'] py-1 ">{$localize`Mostra tutti i tecnici`}</a>
                            </div>
                            <div class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                <a href={"/"+lang+"/admin/panel/clienti"} class="flex-1 text-center text-black text-base font-['Inter'] py-1 ">{$localize`Mostra tutti i clienti`}</a>
                            </div>
                            <div class="flex flex-1 border-b border-gray-100 hover:bg-gray-100 transition-all duration-300">
                                <a href={"/"+lang+"/admin/panel/links"} class="flex-1 text-center text-black text-base font-['Inter'] py-1 ">{$localize`Gestisci rapporto tecnico - clienti`}</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="w-full flex mt-8">

                    <div class="p-2 rounded-lg border-1 w-full md:w-3/4  border-[#cdcdcd] inline-flex justify-start items-center gap-2.5 overflow-hidden">
                        <div class="flex-1 inline-flex flex-col justify-start items-start">
                            <div class="border-b border-[#f3f3f3]">
                                <div class="justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Logs</div>
                            </div>
                            <LogsList />
                            {/* <div class="self-stretch px-[19px] pt-4 pb-[11px] inline-flex justify-start items-center gap-[60px] overflow-hidden">
                            <div class="w-[100px] justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Data</div>
                            <div class="w-12 justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Ora</div>
                            <div class="flex-1 justify-start text-black text-base font-semibold font-['Inter'] leading-normal">Descrizione</div>
                        </div>
                        <div class="self-stretch px-[19px] pt-4 pb-[11px] border-t border-[#e8e8e8] inline-flex justify-start items-center gap-[60px] overflow-hidden">
                            <div class="w-[100px] justify-start text-black text-base font-normal font-['Inter'] leading-normal">10/12/2024</div>
                            <div class="w-12 justify-start text-black text-base font-normal font-['Inter'] leading-normal">12:20</div>
                            <div class="flex-1 justify-start text-black text-base font-normal font-['Inter'] leading-normal">Aggiunta nuova associazione tra il tecnico Mario e Stellantis</div>
                        </div>
                        <div class="self-stretch px-[19px] pt-4 pb-[11px] border-t border-[#e8e8e8] inline-flex justify-start items-center gap-[60px] overflow-hidden">
                            <div class="w-[100px] justify-start text-black text-base font-normal font-['Inter'] leading-normal">10/12/2024</div>
                            <div class="w-12 justify-start text-black text-base font-normal font-['Inter'] leading-normal">12:05</div>
                            <div class="flex-1 justify-start text-black text-base font-normal font-['Inter'] leading-normal">Aggiunto nuovo tecnico “Mario”</div>
                        </div> */}

                        </div>
                    </div>
                </div>


            </div>
        </>
    )
})

export const head: DocumentHead = {
    title: "Admin Panel",
    meta: [
        {
            name: "Admin Page",
            content: "Admin Page for Technician and Clients management",
        },
    ],
};