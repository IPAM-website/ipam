import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";

export const onRequest: RequestHandler = async ({
  cookie,
  redirect,
  sharedMap,
  env,
  locale,
}) => {
  if (cookie.has("jwt")) {
    const user: any = jwt.verify(
      cookie.get("jwt")!.value,
      env.get("JWT_SECRET") as string,
    );
    if (!user.admin) throw redirect(301, "/" + locale() + "/dashboard");
    sharedMap.set("user", user);
  } else throw redirect(301, "/" + locale() + "/login");
};

export default component$(() => {
  return <Slot></Slot>;
});
