import { component$, Signal, withLocale,  } from "@builder.io/qwik";
import { RequestHandler, routeLoader$, useNavigate } from "@builder.io/qwik-city";
import Title from "~/components/layout/Title";
import jwt from "jsonwebtoken"

export const onRequest: RequestHandler = async ({ cookie, redirect, sharedMap, env,locale }) => {
    sharedMap.set("lang",locale());
    if (cookie.has("jwt")) {
        let user: any = jwt.verify(cookie.get("jwt")!.value, env.get("JWT_SECRET") as string)
        sharedMap.set("user", user);
    }
    else
        throw redirect(301, "/login");
};

export const useLang = routeLoader$((event)=>{
    return event.sharedMap.get("lang") || "en";
})

export default component$(() => {
    const nav = useNavigate();
    const lang = useLang();
    return (
        <div class="px-16">
            <Title haveReturn={true} url={"/"+lang.value+"/dashboard"}>{$localize`Impostazioni`}</Title>
            <div class="flex flex-col mt-8 border-gray-200 border rounded-2xl shadow p-8">
                <div class="flex flex-row items-center gap-8 w-full md:w-11/12 lg:w-10/12 mx-auto  ">
                    <label for="cmbLanguage">{$localize`Lingua`}:</label>
                    <select name="cmbLanguage" id="cmbLanguage" class="border border-gray-400 p-3 rounded-lg w-1/6 cursor-pointer">
                        <option value="it" {...{selected : (lang.value as String)=="it"?true:false}} >Italiano</option>
                        <option value="en" {...{selected : (lang.value=="en" as String)?true:false}}>English (default)</option>
                    </select>
                </div> 
                <div class="w-full flex justify-center">
                <button class="mt-8 w-1/2 bg-blue-400 max-w-[120px] text-white rounded-lg p-2 text-lg cursor-pointer border border-blue-200 hover:bg-blue-500 active:bg-blue-600 active:border-2" onClick$={()=>{
                        const cmbLang = document.getElementById("cmbLanguage") as HTMLSelectElement;
                        document.documentElement.lang = cmbLang.value;
                        window.location.href = "/"+cmbLang.value+"/settings"
                    }} >{$localize`Salva`}</button>
                </div>
            </div>
        </div>
    );
})