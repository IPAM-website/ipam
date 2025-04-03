import { component$, Signal, useSignal, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import sql from "~/../db"
import Site from "./siteModel";
import { setSiteName } from "../../layout/Sidebar";



interface SiteListProps {
    searchId: number,
    selectedID?: Signal<number>
}

export const useSite = server$(async function (iddc: number) {
    let siteList: Site[] = [];
    try {
        const query = await sql`SELECT * FROM siti WHERE siti.iddc=${iddc}`
        siteList = query as unknown as Site[];
    }
    catch (e) {
        console.log(e);
    }

    return siteList;
})

export default component$(({searchId,site}:{searchId:number,site:{id:number,name:string}}) => {
    const siteList = useSignal<Site[] | null>(null);
    const nav = useNavigate();
    const loc = useLocation();

    useTask$(async () => {
        siteList.value = await useSite(searchId) as any;
    });

    return (
        <>
            <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                {siteList.value ?
                    siteList.value.map((x: Site) => {
                        return (<div
                            key={x.idsito}
                            class="cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf]"
                            onClick$={()=>{
                                site.id = x.idsito;
                                site.name=x.nomesito;
                                setSiteName(x.nomesito);
                                nav(loc.url.search + "&site="+x.idsito)
                            }}
                        >
                            <img src="" alt={$localize`Immagine Datacenter`} />
                            <p class="font-semibold">{x.nomesito}</p>
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