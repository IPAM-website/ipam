import { $, component$, getLocale } from "@builder.io/qwik";
import { RequestHandler, useNavigate, routeLoader$, DocumentHead } from "@builder.io/qwik-city";
import User from "../user"
import jwt from "jsonwebtoken"

export const onRequest: RequestHandler = async ({ cookie, redirect, sharedMap, env }) => {
    if (cookie.has("jwt")) {
        let user: any = jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string)
        sharedMap.set("user",user);
    }
    else
        throw redirect(301, "/login");
};

export const useUser = routeLoader$(({ sharedMap }) => {
    return sharedMap.get('user') as User;
  });

export default component$(() => {

    const user : User = useUser().value;
    const nav = useNavigate();

    const logout = $(async () => {
        const request = await fetch("/api/cookie", { method: "DELETE" });
        const response = await request.json();

        if (response.success)
            nav("/login");

    })

    return (
        <>
            <div>
                SEI NELLA DASHBOARD!!
            </div>
            <div>
                {user.mail}
                {user.admin ? <p>Sei admin!</p> : <p>Non sei admin 😱​</p>}
            </div>
            <div>
                <button onClick$={logout}>Log out</button>
            </div>
        </>
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