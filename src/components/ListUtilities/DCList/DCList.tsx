import { component$, Signal, useSignal, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import sql from "~/../db"
import DC from "./dcModel";



interface DBListProps {
    searchId: number,
    selectedID?: Signal<number>
}

export const useDC = server$(async function (idClient: number) {
    let dcList: DC[] = [];
    try {
        const query = await sql`SELECT * FROM datacenter WHERE datacenter.idcliente=${idClient}`
        dcList = query as unknown as DC[];
    }
    catch (e) {
        console.log(e);
    }

    return dcList;
})

export default component$(({searchId,datacenter}:{searchId:number,datacenter:{id: number, name: string}}) => {
    const dcList = useSignal<DC[] | null>(null);
    const nav = useNavigate();
    const loc = useLocation();

    useTask$(async () => {
        dcList.value = await useDC(searchId) as any;
    });

    return (
        <>
            <div class="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
                {dcList.value ?
                    dcList.value.map((x: DC) => {
                        return (<div
                            key={x.iddc}
                            class="cursor-pointer hover:-translate-y-1 hover:outline-gray-300 hover:shadow-lg transition-all p-6 bg-white rounded-lg shadow-[0px_4px_12px_0px_rgba(0,0,0,0.04)] outline-1 outline-offset-[-1px] outline-[#dfdfdf]"
                            onClick$={()=>{
                                datacenter.id = x.iddc
                                datacenter.name = x.nomedc;
                                nav(loc.url.search + "&dc="+x.iddc);
                            }}
                        >
                            <img src="" alt={$localize`Immagine Datacenter`} />
                            <p class="font-semibold">{x.nomedc}</p>
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