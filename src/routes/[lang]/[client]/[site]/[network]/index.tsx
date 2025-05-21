import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = ({ redirect }) => {
  throw redirect(301, "info");
};
