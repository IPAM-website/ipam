import { getLocale } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { sqlForQwik } from "../db";
/** this function returns a '/lang/' string */
export const getBaseURL = () => {
  return "/" + getLocale("en") + "/";
};

export const getUser = server$(function () {
  if (!this.cookie.has("jwt")) {
    console.log("Token not found");
    return { id: 0, mail: "", admin: false };
  }
  let user;
  try {
    user = jwt.verify(
      this.cookie.get("jwt")!.value,
      this.env.get("JWT_SECRET")!,
    );
  } catch (e: any) {
    console.log(e);
  }

  this.sharedMap.set("user", user);
  return user as { id: number; mail: string; admin: boolean };
});

export const isUserClient = server$(async function () {
  const sql = sqlForQwik(this.env);
  if (!this.cookie.has("jwt")) {
    console.log("Token not found");
    return false;
  }
  let user;
  let client = true;
  try {
    user = jwt.verify(
      this.cookie.get("jwt")!.value,
      this.env.get("JWT_SECRET")!,
    );
      user = user as { id: number; mail: string; admin: boolean };
    const query =
      await sql`SELECT * FROM usercliente WHERE usercliente.emailucliente=${user.mail}`;
      //console.log(query);
    client = query.length != 0;
  } catch (e: any) {
    console.log(e);
  }

  return client;
});
