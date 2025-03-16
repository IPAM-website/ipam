import { $, component$, getLocale } from "@builder.io/qwik";
import { RequestHandler, useNavigate, routeLoader$, DocumentHead, Form, routeAction$ } from "@builder.io/qwik-city";
import User from "../user"
import jwt from "jsonwebtoken"
import Navbar from "~/components/layout/Navbar";
import SearchBar from "~/components/forms/SearchBar";
import TimeDiv from "~/components/utils/TimeDiv";
import { ClientList } from "~/components/ClientList/ClientList";
import Title from "~/components/layout/Title";


export const onRequest: RequestHandler = async ({ cookie, redirect, sharedMap, env }) => {
    if (cookie.has("jwt")) {
        let user: any = jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string)
        sharedMap.set("user", user);
    }
    else
        throw redirect(301, "/login");
};

export const useUser = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('user') as User;
});

export default component$(() => {

    const user: User = useUser().value;
    const nav = useNavigate();

    

    

    return (
        <div class="size-full px-24 lg:px-40">
            <Title>Client Selection Page</Title>

            <ClientList />

            {user.admin &&
                (<div class="mt-4 flex gap-1 items-center">
                    <a href="/admin/panel" class="hover:underline">Go to admin options</a>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 mt-0.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
                    </svg>

                </div>)}
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