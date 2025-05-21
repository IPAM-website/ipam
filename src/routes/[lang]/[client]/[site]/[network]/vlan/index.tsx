import type { RequestHandler } from "@builder.io/qwik-city";

export const onRequest: RequestHandler = ({ redirect, query, url }) => {
  throw redirect(
    301,
    url.pathname +
      "view" +
      (query.has("network") ? "?network=" + query.get("network") : ""),
  );
};
