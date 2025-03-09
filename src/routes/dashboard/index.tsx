import { component$, getLocale } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import sql from "../../../db"

export const onRequest: RequestHandler = async ({request,cookie,redirect,locale }) => {
    if(cookie.has("mail"))
        console.log(cookie.get("mail")!.value);
    else
        throw redirect(301,"/login");
    const mail = cookie.get("mail")!.value;

    const query = await sql`SELECT * FROM tecnici WHERE emailtecnico=${mail}`
    const user = query[0];

    locale(JSON.stringify(user));
};

export default component$(()=>{

    const loc = getLocale();
    const user = JSON.parse(loc);
    return (
        <>
            <div>
                SEI NELLA DASHBOARD!!
            </div>
            {user.admin ? "Sei admin" : "Non sei admin"}
        </>
    )
})