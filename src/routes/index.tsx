import { component$ } from "@builder.io/qwik";
import { DocumentHead, RequestHandler } from "@builder.io/qwik-city";

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
