import { component$, Slot } from "@builder.io/qwik";
import { useLocation } from "@builder.io/qwik-city";
import SiteNavigator from "~/components/layout/SiteNavigator";
import Title from "~/components/layout/Title";

export default component$(()=>{
    const loc = useLocation();
    return <>
        <Title haveReturn={true} url={loc.url.pathname.split('/info')[0].split('/').slice(0,4).join('/')} > TITOLO </Title>
        <SiteNavigator />
        <Slot />
    </>
})