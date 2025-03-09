import { RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken"

interface userModel {
    mail:string,
    admin:boolean
}

export const onPost : RequestHandler = async ({cookie,parseBody,env,text})=>{
    const {mail, admin}= await parseBody() as userModel;
    const token = await jwt.sign({mail:mail,admin:admin},env.get("JWT_SECRET") as string, {expiresIn:"24h"})

    cookie.set("jwt",token,{
            httpOnly: true,
            maxAge: 60*60*24*7,
            secure: true,
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