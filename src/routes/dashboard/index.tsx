import { $, component$, getLocale } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken"
import { useNavigate } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = async ({ cookie, redirect, locale, env }) => {
    if (cookie.has("jwt")) {
        let user: any = jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string)
        locale(JSON.stringify(user));
    }
    else
        throw redirect(301, "/login");
};

export default component$(() => {

    const user = JSON.parse(getLocale());
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