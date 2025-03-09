import { component$ } from "@builder.io/qwik";
import { DocumentHead, RequestEventAction, routeAction$, Form, zod$, z, RequestHandler } from "@builder.io/qwik-city";
import Textbox from '~/components/forms/Textbox/Textbox';
import FMButton from '~/components/forms/FMButton/FMButton';
import Password from '~/components/forms/Password/Password';
import sql from '../../db';
import FA from "~/components/auth/FA";

export const onRequest: RequestHandler = async ({redirect}) => {
  throw redirect(301,"/login");
};


export default component$(() => {
  return (
    <>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
