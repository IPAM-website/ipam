import { component$, Slot, useVisibleTask$ } from "@builder.io/qwik";
import {
  server$,
  type RequestHandler,
} from "@builder.io/qwik-city";
import { setClientName } from "~/components/layout/Sidebar";
import { sqlForQwik } from "../../../../db";
import { getBaseURL, getUser } from "~/fnUtils";

export const onRequest: RequestHandler = async ({ redirect, env }) => {
  const sql = sqlForQwik(env);
  try {
    const user = await getUser();
    //console.log(user);
    const query1 =
      await sql`SELECT * FROM tecnici WHERE emailtecnico=${user.mail}`;
    if (query1.length == 1) return;
    const query =
      await sql`SELECT * FROM usercliente WHERE usercliente.iducliente=${user.id} AND usercliente.emailucliente=${user.mail}`;
    if (query.length == 0) throw new Error("Unauthorized access");
  } catch (e) {
    console.log(e);
    throw redirect(301, getBaseURL() + "dashboard");
  }
};

export const getClientName = server$(async function () {
  const sql = sqlForQwik(this.env);
  return (
    await sql`SELECT nomecliente FROM clienti WHERE idcliente = ${this.params.client}`
  )[0].nomecliente;
});

export default component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    setClientName(await getClientName());
  });
  return (
    <div class="md:px-24 lg:px-40">
      <Slot />
    </div>
  );
});
