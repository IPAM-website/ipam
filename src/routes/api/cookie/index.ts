import { RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken"

export const onPost : RequestHandler = async ({cookie,parseBody,env,text})=>{
    const {mail, admin, id}= await parseBody() as {mail:string,admin:boolean,id:number};
    const token = jwt.sign({mail:mail,admin:admin,id:id},env.get("JWT_SECRET") as string, {expiresIn:"24h"})

    cookie.set("jwt",token,{
            httpOnly: true,
            maxAge: 60*60*24*7,
            path: '/'
        })

    cookie.set("mail","",{
        maxAge: -1
    })

    text(200,token);
}

export const onDelete : RequestHandler = async ({cookie,json})=>{
    cookie.delete("jwt",{
        path: '/'
    });
    json(200,{success:true});
}