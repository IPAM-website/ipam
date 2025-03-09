import { RequestHandler } from "@builder.io/qwik-city";

export const onPost : RequestHandler = async ({cookie,parseBody,text})=>{
    const ck : any = await parseBody();
    cookie.set("mail",ck.mail as string,{
            httpOnly: true,
            maxAge: 60*60*24*7,
            secure: true,
            path: '/'
        })
    text(200,JSON.stringify(cookie));
}