import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = ({ url, redirect }) => {
  throw redirect(301, url.pathname + "view");
};
