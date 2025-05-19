import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = ({redirect,locale})=>{
  throw redirect(301,locale("en-US")+"/login");
}