import { component$, Signal, useSignal, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import sql from "~/../db"
import Network from "./networkModel";

export const useNetwork = server$(async function (idSottoSito: number) {
    let networkList: Network[] = [];
    try {
        const query = await sql`SELECT * FROM sottositi_rete INNER JOIN rete ON sottositi_rete.idrete = rete.idrete WHERE idsottosito = ${idSottoSito}`
        networkList = query as unknown as Network[];
    }
    catch (e) {
        console.log(e);
    }

    return networkList;
})

export default component$(({searchId,network}:{searchId:number,network:{id:number,name:string}}) => {
    const networkList = useSignal<Network[] | null>(null);
    const nav = useNavigate();
    const loc = useLocation();

    useTask$(async () => {
        networkList.value = await useNetwork(searchId) as any;
    });

    return (
        <>
            <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                {networkList.value ?
                    networkList.value.map((x: Network) => {
                        return (<div
                            key={x.idrete}
                            class="cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf]"
                            onClick$={()=>{
                                network.id = x.idrete
                                network.name=x.nomerete
                                nav(loc.url.search + "&network="+x.idrete)
                            }}
                        >
                            <img src="" alt={$localize`Immagine Datacenter`} />
                            <p class="font-semibold">{x.nomerete}</p>
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