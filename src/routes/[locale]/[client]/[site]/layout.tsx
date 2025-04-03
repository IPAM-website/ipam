import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { server$, useLocation, type RequestHandler } from "@builder.io/qwik-city";
import { setClientName, setSiteName } from "~/components/layout/Sidebar";
import sql from "../../../../../db";
import { getBaseURL, getUser } from "~/fnUtils";

export const onRequest : RequestHandler = async({params,redirect})=>{
    
    try{
        const query = await sql`SELECT * FROM datacenter INNER JOIN siti ON datacenter.iddc=siti.iddc AND datacenter.idcliente = ${params.client} WHERE siti.idsito = ${params.site}`
        if(query.length==0)
            throw new Error("Unauthorized access");
    }catch(e)
    {
        throw redirect(301,getBaseURL()+"dashboard");
    }
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
