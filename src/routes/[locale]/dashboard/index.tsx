import { component$, getLocale, useStore, useTask$, useVisibleTask$ } from "@builder.io/qwik";
import { RequestHandler, useNavigate, routeLoader$, DocumentHead } from "@builder.io/qwik-city";
import ClientList from "~/components/ListUtilities/ClientList/ClientList";
import Title from "~/components/layout/Title";
import { getBaseURL, getUser } from "~/fnUtils";
import { ClienteModel, TecnicoModel, UtenteModel } from "~/dbModels";
import sql from "../../../../db";


export const onRequest: RequestHandler = async ({ cookie, redirect, sharedMap,  }) => {

    try {
        const user = await getUser();
        sharedMap.set("user", user);
        //console.log(user)
        const result = await sql`SELECT idcliente FROM usercliente WHERE emailucliente = ${user.mail}`
        //console.log(result[0].idcliente.toString())
        if(result.length != 0)
            throw redirect(301, getBaseURL() + result[0].idcliente.toString());

    }
    catch (e) {
        throw redirect(302, getBaseURL() + "login");
    }

};

export const useUser = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('user') as TecnicoModel;
});

export default component$(() => {

    const user: TecnicoModel = useUser().value;

    return (
        <div class="size-full lg:px-40 px-24">
            <Title>{$localize`: @@dbTitle:Client Selection Page`}</Title>
            <ClientList />


            {user.admin && (
                <div class="flex gap-1 items-center mt-4">
                    <a href={`/${getLocale("en")}/admin/panel`} class="hover:underline">
                        {$localize`Go to admin options`}
                    </a>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="mt-0.5 size-4"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                        />
                    </svg>
                </div>
            )}
        </div>
    )
})

export const head: DocumentHead = {
    title: "Dashboard",
    meta: [
        {
            name: "Pagina iniziale",
            content: "Pagina iniziale dell'applicazione IPAM",
        },
    ],
};