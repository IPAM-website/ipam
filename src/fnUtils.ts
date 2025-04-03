import { getLocale } from "@builder.io/qwik"
import { server$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken"
/** this function returns a '/lang/' string */
export const getBaseURL = () => {
    return "/" + getLocale("en") + "/";
}

export const getUser = server$(function () {
    if (!this.cookie.has("jwt"))
        throw new Error("Token not found");

    let user = jwt.verify(this.cookie.get("jwt")!.value, this.env.get("JWT_SECRET")!);
    try{
    }catch(e:any){
        throw new Error(e);
    }

    this.sharedMap.set("user", user);
    return user as { id: number, mail: string, admin: boolean };

})