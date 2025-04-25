import { RequestHandler } from "@builder.io/qwik-city"

export const onRequest : RequestHandler = ({redirect})=>{
    throw redirect(301,"addresses/view")
}