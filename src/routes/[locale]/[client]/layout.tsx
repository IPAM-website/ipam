import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import { server$, useLocation, type RequestHandler } from "@builder.io/qwik-city";
import { setClientName } from "~/components/layout/Sidebar";
import sql from "../../../../db";
import { getBaseURL, getUser } from "~/fnUtils";

export const onRequest: RequestHandler = async ({ params, redirect }) => {

    try {
        const user = await getUser();
        const query = await sql`SELECT * FROM tecnici WHERE tecnici.idtecnico=${user.id} AND tecnici.emailtecnico=${user.mail}`;
        if (query.length == 0)
            throw new Error("Unauthorized access");
    } catch (e) {
        console.log(e);
        throw redirect(301, getBaseURL() + "dashboard");
    }
}

export const getClientName = server$(async function () {
    return (await sql`SELECT nomecliente FROM clienti WHERE idcliente = ${this.params.client}`)[0].nomecliente
})

export default component$(() => {
    useVisibleTask$(async () => {
        setClientName(await getClientName());
    })
    return <div  class="lg:px-40 md:px-24">
        <Slot />
    </div>
});
