import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { server$, StaticGenerateHandler, useLocation, type RequestHandler } from "@builder.io/qwik-city";
import { setClientName, setSiteName } from "~/components/layout/Sidebar";
import sql from "../../../../../db";
import { getBaseURL, getUser } from "~/fnUtils";

export const onStaticGenerate: StaticGenerateHandler = async () => {
    return {
        params: []
    };
};


export const onRequest : RequestHandler = async({redirect})=>{
    
}

export const getSiteName= server$(async function(){
    return (await sql`SELECT nomesito FROM siti WHERE idsito = ${this.params.site}`)[0].nomesito
})

export default component$(() => {
    useVisibleTask$(async ()=>{
        setSiteName(await getSiteName());
    })
  return <Slot />;
});
