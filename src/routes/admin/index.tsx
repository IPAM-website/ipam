import { $, component$ } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";

export const onRequest : RequestHandler = async ({redirect})=>{
    throw redirect(301,"/admin/panel");
}