import { RequestHandler } from "@builder.io/qwik-city"

export const onRequest : RequestHandler = ({redirect,query})=>{
    throw redirect(301,"view" + (query.has('network') ? "?network="+query.get('network') : ""))
}