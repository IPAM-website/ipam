import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = ({ redirect, url }) => {
  throw redirect(301, url.pathname + "view");
};
