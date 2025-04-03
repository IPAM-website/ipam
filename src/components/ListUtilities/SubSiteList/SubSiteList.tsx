import { component$, Signal, useSignal, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import sql from "~/../db"
import Subsite from "./subsiteModel";

interface SubSiteListProps {
    searchId: number,
    selectedID?: Signal<number>
}

export const useSubSite = server$(async function (idSito: number) {
    let siteList: Subsite[] = [];
    try {
        const query = await sql`SELECT * FROM sotto_siti WHERE idsito = ${idSito}`
        siteList = query as unknown as Subsite[];
    }
    catch (e) {
        console.log(e);
    }

    return siteList;
})

export default component$(({searchId,subsite}:{searchId:number,subsite:{id:number,name:string}}) => {
    const siteList = useSignal<Subsite[] | null>(null);
    const nav = useNavigate();
    const loc = useLocation();

    useTask$(async () => {
        siteList.value = await useSubSite(searchId) as any;
    });

    return (
        <>
            <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                {siteList.value ?
                    siteList.value.map((x: Subsite) => {
                        return (<div
                            key={x.idsottosito}
                            class="cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf]"
                            onClick$={()=>{
                                subsite.id = x.idsottosito
                                subsite.name=x.nomesottosito
                                nav(loc.url.search + "&subsite="+x.idsottosito)
                            }}
                        >
                            <img src="" alt={$localize`Immagine Datacenter`} />
                            <p class="font-semibold">{x.nomesottosito}</p>
                        </div>)
                    })
                    :
                    <div
                        class="cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf] min-w-[300px] max-w-[400px] justify-start"
                    >
                        <p class="font-semibold">{$localize`Non ci sono datacenter associati`}</p>
                    </div>}

            </div>

        </>);
})