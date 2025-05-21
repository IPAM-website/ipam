import type { DocumentHead, RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = async ({ redirect }) => {
  throw redirect(301, "/admin/panel");
};

export const head: DocumentHead = {
  title: "Admin Panel",
  meta: [
    {
      name: "Admin Page",
      content: "Admin Page for Technician and Clients management",
    },
  ],
};
