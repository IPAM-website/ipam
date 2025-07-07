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

export const compareIPs = (ip1:string,ip2:string)=>{
  if(ip1.split('.').length!=4 || ip2.split('.').length!=4) throw new Error("Format Error");
  const parsedIP1 = ip1.split('.').map((x:string)=>parseInt(x));
  const parsedIP2 = ip2.split('.').map((x:string)=>parseInt(x));
  for(const index in parsedIP1)
  {
    if(parsedIP1[index]<parsedIP2[index])
      return -1;      
    else if(parsedIP1[index]>parsedIP2[index])
      return 1;
  }

  return 0;
}