/* eslint-disable qwik/no-use-visible-task */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import {
  server$,
} from "@builder.io/qwik-city";
import {  setSiteName } from "~/components/layout/Sidebar";
import sql from "../../../../../db";

export const getSiteName = server$(async function () {
  return (
    await sql`SELECT nomesito FROM siti WHERE idsito = ${this.params.site}`
  )[0].nomesito;
});

export default component$(() => {
  useVisibleTask$(async () => {
    try{
      setSiteName(await getSiteName());
    }catch{
      console.error("error during fetch")
    }
  });
  return <Slot />;
});
