import { DocumentHead, RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = async ({ redirect }) => {
  throw redirect(301, "/login");
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
