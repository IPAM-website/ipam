import { component$, getLocale, Slot, useSignal, useTask$ } from "@builder.io/qwik";
import { routeLoader$, server$, useLocation } from "@builder.io/qwik-city";
import SiteNavigator from "~/components/layout/SiteNavigator";
import Title from "~/components/layout/Title";
import sql from "~/../db";

export const getNetworkName = routeLoader$(async function (event) {
    if (event.params.network == '0')
        return { nomerete: "", iprete: "-1" }
    return (await sql`SELECT nomerete, iprete FROM rete WHERE idrete = ${event.params.network}`)[0] as { nomerete: string, iprete: string };
})

export default component$(() => {
    const loc = useLocation();
    const networkName = getNetworkName();
    const extraCLS = useSignal<string>("");

    useTask$(({track})=>{
        track(()=>loc.url.href);
        extraCLS.value="animateEnter"
    })

    return <>
        <Title haveReturn={true} url={loc.url.pathname.split('/info')[0].split('/').slice(0, 4).join('/')} >{networkName.value.iprete != "-1" ? `${networkName.value.nomerete} - ${networkName.value.iprete}` : ($localize`Unknown network`)} </Title>
        <SiteNavigator onPageChange$={()=>extraCLS.value="opacity-0"}/>
        <div class={"mt-5 duration-300 ease-in transition-all " + extraCLS.value}>
            <Slot />
        </div>
    </>
})