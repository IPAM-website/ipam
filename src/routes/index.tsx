import { DocumentHead, RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = async ({ redirect, locale }) => {
  throw redirect(302, "/"+locale("en")+"/login");
};

export const head: DocumentHead = {
  title: "IPAM",
  meta: [
    {
      name: "IPAM",
      content: "IPAM",
    },
  ],
};
